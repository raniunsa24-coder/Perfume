import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';

const imageBase = 'https://images.unsplash.com/';
const seedProducts = [
  { productCode:'01', name:'Velvet Saffron', slug:'velvet-saffron', family:'AMBER · SPICE', price:148, notes:'Saffron / black tea / smoked vanilla', volume:'50 ml · Eau de parfum', tag:'THE SIGNATURE', image:`${imageBase}photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1100&q=90`, imageAlt:'Amber perfume bottle in dramatic studio light', tone:'#b77b42', mood:'Warm, magnetic, unhurried', stock:25, featured:true },
  { productCode:'02', name:'After the Rain', slug:'after-the-rain', family:'GREEN · WOODY', price:126, notes:'Bergamot / wet cedar / vetiver', volume:'50 ml · Eau de parfum', tag:'FRESH ARRIVAL', image:`${imageBase}photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1100&q=90`, imageAlt:'Minimal glass perfume bottle with a soft green mood', tone:'#7f9277', mood:'Clean, alive, quietly bold', stock:25 },
  { productCode:'03', name:'Midnight Fig', slug:'midnight-fig', family:'FRUIT · MUSK', price:132, notes:'Black fig / iris / skin musk', volume:'50 ml · Eau de parfum', tag:'AFTER DARK', image:`${imageBase}photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1100&q=90`, imageAlt:'Elegant perfume bottle with rosy reflections', tone:'#947080', mood:'Soft skin, dark fruit, late hours', stock:25 },
  { productCode:'04', name:'Oud No. 09', slug:'oud-no-09', family:'RESIN · OUD', price:184, notes:'Aged oud / rose absolute / amber', volume:'50 ml · Extrait de parfum', tag:'ATELIER EDITION', image:`${imageBase}photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1100&q=90`, imageAlt:'Luxury perfume bottle with rich golden liquid', tone:'#9c7950', mood:'Deep, smoky, unforgettable', stock:25 },
  { productCode:'05', name:'White Static', slug:'white-static', family:'CITRUS · MUSK', price:118, notes:'Neroli / crushed pear / clean musk', volume:'50 ml · Eau de parfum', tag:'SKIN SCENT', image:`${imageBase}photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1100&q=90`, imageAlt:'A refined fragrance bottle in soft daylight', tone:'#c4b7a3', mood:'Airy, luminous, close to skin', stock:25 },
  { productCode:'06', name:'Rose After Hours', slug:'rose-after-hours', family:'FLORAL · AMBER', price:156, notes:'Damask rose / pink pepper / incense', volume:'50 ml · Eau de parfum', tag:'LIMITED POUR', image:`${imageBase}photo-1618436623771-29df2e27f809?auto=format&fit=crop&w=1100&q=90`, imageAlt:'Real perfume bottle styled with soft pink rose petals', tone:'#a85d5b', mood:'Petal-soft with a dark edge', stock:18, featured:true }
];

try {
  await connectDB();
  for (const product of seedProducts) {
    await Product.findOneAndUpdate({ productCode: product.productCode }, { $set: product }, { upsert: true, new: true, runValidators: true });
  }
  console.log(`Seed complete: ${seedProducts.length} fragrance products are available.`);
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
