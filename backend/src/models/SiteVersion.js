import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    id: {
      type: String
    },
    name: {
      type: String
    },

    type: {
      type: String
    },

    path: {
      type: String,
      validate: {
        validator: (v) =>
          !v || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v),
        message: (v) => `${v} n'est pas un lien d'image valide`
      }
    },

    alt: {
      type: String
    }
  },
  { _id: false }
);

const homeSchema = new mongoose.Schema(
  {
    title: String,
    paragraph: String,
    backgroundImage: imageSchema,
  },
  { _id: false }
);

const aboutSchema = new mongoose.Schema(
  {
    title: String,
    paragraph: String,
    why: [String],
    aboutImage: imageSchema,
    items: [
      new mongoose.Schema(
        {
          title: String,
          text: String,
          image: imageSchema,
        },
        { _id: false }
      ),
    ],
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    icon: imageSchema,
    title: String,
    text: String,
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    largeImage: imageSchema,
    smallImage: imageSchema,
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    img: imageSchema,
    name: String,
    job: String,
  },
  { _id: false }
);

const newsSchema = new mongoose.Schema(
  {
    img: imageSchema,
    name: String,
    text: String,
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    address: String,
    phone: String,
    email: String,
    whatsapp: String,
    facebook: String,
    instagram: String,
    linkedin: String,
    twitter: String,
    youtube: String,
  },
  { _id: false }
);

const donationSchema = new mongoose.Schema(
  {
    address: String,
    phone: String,
    email: String,
    whatsapp: String,
    facebook: String,
    instagram: String,
    linkedin: String,
    twitter: String,
    youtube: String,
  },
  { _id: false }
);

const contentSchema = new mongoose.Schema(
  {
    home: homeSchema,
    about: aboutSchema,
    activities: [activitySchema],
    projects: [projectSchema],
    team: [teamSchema],
    news: [newsSchema],
    contact: contactSchema,
    donation: donationSchema,
  },
  {
    _id: false,
    strict: false,
  }
);

const siteVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, unique: true },
    content: contentSchema,
    description: String,

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    isActive: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    activatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

siteVersionSchema.pre("validate", async function () {
  if (!this.version) {
    const last = await this.constructor
      .findOne({ version: { $type: "number" } })
      .sort({ version: -1 });
    this.version = last ? last.version + 1 : 1;
  }
});

siteVersionSchema.pre("save", async function () {
  if (this.isActive) {
    if (this.status !== "published") {
      throw new Error("Seules les versions publiées peuvent être activées.");
    }
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
});

export default mongoose.model("SiteVersion", siteVersionSchema);
