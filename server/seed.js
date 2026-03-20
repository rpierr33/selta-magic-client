require('dotenv').config();

const pool = require('./database');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        category VARCHAR(100),
        brand VARCHAR(100),
        image VARCHAR(500),
        rating DECIMAL(2,1) DEFAULT 0,
        reviews INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        name VARCHAR(255),
        price DECIMAL(10,2),
        image VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(30) DEFAULT 'pending',
        payment_intent_id VARCHAR(255),
        shipping_first_name VARCHAR(100),
        shipping_last_name VARCHAR(100),
        shipping_address_line_1 VARCHAR(255),
        shipping_address_line_2 VARCHAR(255),
        shipping_city VARCHAR(100),
        shipping_state VARCHAR(100),
        shipping_postal_code VARCHAR(20),
        shipping_country VARCHAR(100),
        tracking_number VARCHAR(100),
        shipped_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID,
        product_name VARCHAR(255) NOT NULL,
        product_image VARCHAR(500),
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) DEFAULT 'shipping',
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL,
        phone VARCHAR(30),
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name VARCHAR(200) NOT NULL,
        email VARCHAR(255),
        product_name VARCHAR(255),
        product_id UUID,
        message TEXT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('Tables created successfully.');

    // Seed admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role)
      VALUES (gen_random_uuid(), 'admin@seltamagic.com', $1, 'Admin', 'Selta', 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [adminPasswordHash]);

    console.log('Admin user seeded (admin@seltamagic.com / admin123).');

    // Seed categories
    await client.query(`
      INSERT INTO categories (id, name, description) VALUES
        (gen_random_uuid(), 'Hair Care', 'Hair care products including oils, treatments, and accessories'),
        (gen_random_uuid(), 'Skin Care', 'Skin care products including soaps, creams, and treatments'),
        (gen_random_uuid(), 'Hair Accessories', 'Wigs, extensions, and hair accessories')
      ON CONFLICT (name) DO NOTHING
    `);

    console.log('Categories seeded.');

    // Seed products
    await client.query(`
      INSERT INTO products (id, name, description, price, original_price, category, brand, image, rating, reviews)
      VALUES
        (
          gen_random_uuid(),
          'Selta Magic Growth Elixir',
          'A clinically-inspired blend of nutrient-rich botanical oils designed to restore strength, stimulate growth, and deeply nourish the scalp. Selta Magic Growth Elixir penetrates beyond the surface to support healthier, fuller hair — without synthetic fillers or harsh chemicals. Lightweight yet potent, this formula is ideal for protective styles, natural hair, and chemically treated hair alike. Target the scalp. Transform the hair.',
          29.99,
          39.99,
          'Hair Care',
          'Selta',
          '/lovable-uploads/hair-oil.avif',
          4.9,
          128
        ),
        (
          gen_random_uuid(),
          'Selta Magic Purifying Bar',
          'A gentle yet effective cleansing bar formulated to purify, balance, and restore the skin without stripping its natural moisture barrier. Infused with plant-based ingredients known for their clarifying and soothing properties, this bar is ideal for daily use on face and body. Designed for melanin-rich skin, it helps promote an even, radiant complexion. Clean skin. Clear confidence.',
          14.99,
          NULL,
          'Skin Care',
          'Selta',
          '/lovable-uploads/soap.avif',
          4.7,
          94
        ),
        (
          gen_random_uuid(),
          'Selta Magic Premium Unit',
          'Crafted for effortless beauty and confidence, the Selta Magic Premium Unit delivers a natural, flawless look with minimal effort. Designed to blend seamlessly and elevate your everyday style, this unit offers versatility, comfort, and durability. Whether worn daily or occasionally, it is beauty — simplified. Luxury hair. Zero compromise.',
          89.99,
          119.99,
          'Hair Accessories',
          'Selta',
          '/lovable-uploads/hair-wig.avif',
          4.8,
          56
        ),
        (
          gen_random_uuid(),
          'Selta Magic Brightening Eye Therapy',
          'A targeted treatment formulated to visibly reduce dark circles, puffiness, and signs of fatigue. This lightweight, fast-absorbing cream delivers hydration and revitalization to the delicate under-eye area. Engineered with a clean, clinical approach to help you look rested — even when you are not. Look awake. Stay powerful.',
          34.99,
          44.99,
          'Skin Care',
          'Selta',
          '/lovable-uploads/eye-cream.avif',
          4.9,
          72
        )
      ON CONFLICT DO NOTHING
    `);

    console.log('Products seeded.');

    // Seed sample testimonials
    await client.query(`
      INSERT INTO testimonials (id, customer_name, email, product_name, message, rating, is_approved)
      VALUES
        (gen_random_uuid(), 'Sarah M.', 'sarah@example.com', 'Selta Magic Growth Elixir', 'This hair oil has completely transformed my hair! It is so soft and shiny now. I have been using it for 3 months and the results are amazing.', 5, true),
        (gen_random_uuid(), 'James K.', 'james@example.com', 'Selta Magic Purifying Bar', 'Best soap I have ever used. My skin feels so clean and moisturized. Will definitely be ordering more!', 5, true),
        (gen_random_uuid(), 'Michelle R.', 'michelle@example.com', 'Selta Magic Brightening Eye Therapy', 'I noticed a difference in my dark circles within just 2 weeks. This eye cream is a game changer. Highly recommend!', 5, true),
        (gen_random_uuid(), 'Aisha T.', 'aisha@example.com', 'Selta Magic Premium Unit', 'The quality of this wig is outstanding. It looks so natural and is very comfortable to wear all day.', 4, true)
      ON CONFLICT DO NOTHING
    `);

    console.log('Testimonials seeded.');

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Failed to seed database:', err.message);
  process.exit(1);
});
