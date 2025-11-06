-- Add Membership.io ID tracking to user_memberships
ALTER TABLE user_memberships 
ADD COLUMN IF NOT EXISTS membershipio_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_memberships_membershipio_id 
ON user_memberships(membershipio_id);