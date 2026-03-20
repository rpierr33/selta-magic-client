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
          'Selta Magic Hair Oil',
          'Strengthen and nourish your hair with our premium Selta Magic Hair Oil. Formulated with natural oils and essential vitamins, this powerful blend penetrates deeply to fortify hair from root to tip, promoting healthy growth and a lustrous shine. Recommended for all hair types.',
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
          'Selta Magic Soap',
          'Cleanse and moisturize with our gentle yet effective Selta Magic Soap. Specially crafted for all skin types, this nourishing soap combines natural ingredients to leave your skin feeling soft, hydrated, and refreshed after every use. Perfect for daily skincare.',
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
          'Luxurious Hair Wig',
          'Transform your look with our premium quality Luxurious Hair Wig. Designed to suit all hair types, this beautifully crafted wig offers a natural appearance and comfortable fit, giving you the confidence to express your unique style effortlessly.',
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
          'Selta Magic Eye Cream',
          'Revitalize and brighten the delicate skin around your eyes with our Selta Magic Eye Cream. This advanced formula targets dark circles, puffiness, and fine lines with a blend of nourishing botanicals and peptides for a youthful, refreshed appearance.',
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
        (gen_random_uuid(), 'Sarah M.', 'sarah@example.com', 'Selta Magic Hair Oil', 'This hair oil has completely transformed my hair! It is so soft and shiny now. I have been using it for 3 months and the results are amazing.', 5, true),
        (gen_random_uuid(), 'James K.', 'james@example.com', 'Selta Magic Soap', 'Best soap I have ever used. My skin feels so clean and moisturized. Will definitely be ordering more!', 5, true),
        (gen_random_uuid(), 'Michelle R.', 'michelle@example.com', 'Selta Magic Eye Cream', 'I noticed a difference in my dark circles within just 2 weeks. This eye cream is a game changer. Highly recommend!', 5, true),
        (gen_random_uuid(), 'Aisha T.', 'aisha@example.com', 'Luxurious Hair Wig', 'The quality of this wig is outstanding. It looks so natural and is very comfortable to wear all day.', 4, true)
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
