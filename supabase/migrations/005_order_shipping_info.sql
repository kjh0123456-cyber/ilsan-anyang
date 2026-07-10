ALTER TABLE orders
  ADD COLUMN recipient_name text,
  ADD COLUMN phone text,
  ADD COLUMN zip_code text,
  ADD COLUMN address text,
  ADD COLUMN address_detail text,
  ADD COLUMN delivery_request text;
