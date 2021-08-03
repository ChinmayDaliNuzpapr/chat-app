const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "nuzpapr-technolabs",
  api_key: "126467856159596",
  api_secret: "AL0rn6wraO5W_wMyJMu2C1toNHM",
});
exports.uploads = (file) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      (result) => {
        resolve({ url: result.url, id: result.public_id });
      },
      { resource_type: "auto" }
    );
  });
};
