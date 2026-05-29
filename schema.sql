-- =============================================================
--  THE PASS REGISTRY — database schema
--  Run this once in Supabase: Dashboard > SQL Editor > New query
--  (paste the whole file and press Run).
-- =============================================================

-- ---------- TABLES ----------

-- One profile row per signed-up user. The username is what others see.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique not null,
  created_at timestamptz not null default now()
);

-- Who holds how many of whose passes.
-- A row means: `holder_id` currently holds `balance` passes that were issued by `issuer_id`.
create table if not exists public.holdings (
  holder_id uuid not null references public.profiles(id) on delete cascade,
  issuer_id uuid not null references public.profiles(id) on delete cascade,
  balance   bigint not null default 0 check (balance >= 0),
  primary key (holder_id, issuer_id)
);

-- Immutable ledger of every pass exchange. Every exchange carries a comment.
create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid references public.profiles(id),
  recipient_id uuid not null references public.profiles(id),
  issuer_id    uuid not null references public.profiles(id),
  amount       bigint not null check (amount > 0),
  comment      text not null,
  created_at   timestamptz not null default now()
);

-- Pass requests: requester asks `target` to send them `issuer`-type passes.
create table if not exists public.requests (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  target_id    uuid not null references public.profiles(id) on delete cascade,
  issuer_id    uuid not null references public.profiles(id) on delete cascade,
  amount       bigint not null check (amount > 0),
  comment      text not null,
  status       text not null default 'pending'
                 check (status in ('pending','accepted','declined','cancelled')),
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

create index if not exists idx_holdings_issuer on public.holdings(issuer_id);
create index if not exists idx_tx_recipient on public.transactions(recipient_id);
create index if not exists idx_tx_sender on public.transactions(sender_id);
create index if not exists idx_req_target on public.requests(target_id);
create index if not exists idx_req_requester on public.requests(requester_id);

-- ---------- NEW-USER TRIGGER ----------
-- When someone signs up, create their profile from the username they chose.
-- If the username is taken, fall back to a unique suffix so signup never breaks.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := nullif(trim(new.raw_user_meta_data->>'username'), '');
begin
  if v_name is null then
    v_name := 'user_' || left(new.id::text, 8);
  end if;
  begin
    insert into public.profiles (id, username) values (new.id, v_name);
  exception when unique_violation then
    insert into public.profiles (id, username)
    values (new.id, v_name || '_' || left(new.id::text, 4));
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- CORE LOGIC: TRANSFER ----------
-- Hands out `amount` of `p_issuer`-type passes from the caller to `p_recipient`.
--   * If the caller IS the issuer  -> unlimited supply, nothing is deducted (they mint their own).
--   * If the caller is NOT the issuer -> they must already hold enough of that pass type.
-- Runs as a single transaction, so passes can never be double-spent.
create or replace function public.transfer_passes(
  p_recipient uuid,
  p_issuer    uuid,
  p_amount    bigint,
  p_comment   text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender uuid := auth.uid();
begin
  if v_sender is null then raise exception 'Not signed in'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Amount must be a positive whole number'; end if;
  if nullif(trim(p_comment), '') is null then raise exception 'A comment is required for every exchange'; end if;
  if p_recipient = v_sender then raise exception 'You cannot send passes to yourself'; end if;

  if not exists (select 1 from profiles where id = p_recipient) then
    raise exception 'Recipient does not exist';
  end if;
  if not exists (select 1 from profiles where id = p_issuer) then
    raise exception 'That pass type does not exist';
  end if;

  -- Deduct from the sender only when they are NOT the issuer of the pass.
  if v_sender <> p_issuer then
    update holdings
       set balance = balance - p_amount
     where holder_id = v_sender
       and issuer_id = p_issuer
       and balance  >= p_amount;
    if not found then
      raise exception 'You do not have enough of those passes';
    end if;
  end if;

  -- Credit the recipient.
  insert into holdings (holder_id, issuer_id, balance)
  values (p_recipient, p_issuer, p_amount)
  on conflict (holder_id, issuer_id)
  do update set balance = holdings.balance + excluded.balance;

  insert into transactions (sender_id, recipient_id, issuer_id, amount, comment)
  values (v_sender, p_recipient, p_issuer, p_amount, trim(p_comment));
end;
$$;

-- ---------- REQUESTS ----------
-- Create a request: the caller asks `p_target` to send them `p_issuer`-type passes.
create or replace function public.create_request(
  p_target  uuid,
  p_issuer  uuid,
  p_amount  bigint,
  p_comment text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_id uuid;
begin
  if v_me is null then raise exception 'Not signed in'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Amount must be a positive whole number'; end if;
  if nullif(trim(p_comment), '') is null then raise exception 'A comment is required'; end if;
  if p_target = v_me then raise exception 'You cannot request passes from yourself'; end if;
  if not exists (select 1 from profiles where id = p_target) then raise exception 'That person does not exist'; end if;
  if not exists (select 1 from profiles where id = p_issuer) then raise exception 'That pass type does not exist'; end if;

  insert into requests (requester_id, target_id, issuer_id, amount, comment)
  values (v_me, p_target, p_issuer, p_amount, trim(p_comment))
  returning id into v_id;
  return v_id;
end;
$$;

-- Accept a request: only the target may accept. Performs the transfer atomically.
create or replace function public.accept_request(p_request uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  r    record;
begin
  if v_me is null then raise exception 'Not signed in'; end if;

  select * into r from requests where id = p_request for update;
  if not found then raise exception 'Request not found'; end if;
  if r.target_id <> v_me then raise exception 'This request was not sent to you'; end if;
  if r.status <> 'pending' then raise exception 'This request has already been handled'; end if;

  if v_me <> r.issuer_id then
    update holdings
       set balance = balance - r.amount
     where holder_id = v_me and issuer_id = r.issuer_id and balance >= r.amount;
    if not found then raise exception 'You do not have enough of those passes to fulfil this request'; end if;
  end if;

  insert into holdings (holder_id, issuer_id, balance)
  values (r.requester_id, r.issuer_id, r.amount)
  on conflict (holder_id, issuer_id)
  do update set balance = holdings.balance + excluded.balance;

  insert into transactions (sender_id, recipient_id, issuer_id, amount, comment)
  values (v_me, r.requester_id, r.issuer_id, r.amount, 'Request fulfilled — ' || r.comment);

  update requests set status = 'accepted', resolved_at = now() where id = p_request;
end;
$$;

-- Decline (target) or cancel (requester) a pending request.
create or replace function public.resolve_request(p_request uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  r    record;
begin
  if v_me is null then raise exception 'Not signed in'; end if;
  select * into r from requests where id = p_request for update;
  if not found then raise exception 'Request not found'; end if;
  if r.status <> 'pending' then raise exception 'This request has already been handled'; end if;

  if p_action = 'declined' and r.target_id = v_me then
    update requests set status = 'declined', resolved_at = now() where id = p_request;
  elsif p_action = 'cancelled' and r.requester_id = v_me then
    update requests set status = 'cancelled', resolved_at = now() where id = p_request;
  else
    raise exception 'You are not allowed to do that';
  end if;
end;
$$;

-- Lets the sign-up screen check a username before the account exists (callable by anon).
create or replace function public.username_available(p_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (select 1 from profiles where username = lower(trim(p_username)));
$$;

-- ---------- ROW LEVEL SECURITY ----------
-- Reads are open to any signed-in user (so pass counts & history are public to members).
-- All writes happen only through the functions above (which run as definer), so the
-- ledger rules can never be bypassed by editing tables directly from the browser.
alter table public.profiles     enable row level security;
alter table public.holdings     enable row level security;
alter table public.transactions enable row level security;
alter table public.requests     enable row level security;

drop policy if exists "profiles readable"      on public.profiles;
drop policy if exists "holdings readable"      on public.holdings;
drop policy if exists "transactions readable"  on public.transactions;
drop policy if exists "requests readable"      on public.requests;
drop policy if exists "update own profile"     on public.profiles;

create policy "profiles readable"     on public.profiles     for select to authenticated using (true);
create policy "holdings readable"     on public.holdings     for select to authenticated using (true);
create policy "transactions readable" on public.transactions for select to authenticated using (true);
-- Requests are visible only to the two parties involved.
create policy "requests readable"     on public.requests     for select to authenticated
  using (requester_id = auth.uid() or target_id = auth.uid());
-- Allow members to rename themselves (uniqueness still enforced by the constraint).
create policy "update own profile"    on public.profiles     for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Let signed-in users execute the logic functions.
grant execute on function public.transfer_passes(uuid, uuid, bigint, text) to authenticated;
grant execute on function public.create_request(uuid, uuid, bigint, text)  to authenticated;
grant execute on function public.accept_request(uuid)                      to authenticated;
grant execute on function public.resolve_request(uuid, text)               to authenticated;
grant execute on function public.username_available(text)                  to anon, authenticated;
