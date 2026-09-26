const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    icon: {
      type: String,
      default: 'Tag',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    eventCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

categorySchema.pre('save', function () {
  this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
});

module.exports = mongoose.model('Category', categorySchema);
