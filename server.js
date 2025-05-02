import app from './app.js';

const PORT = process.env.PORT || 3001;
const ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  if (ENV === 'production') {
    console.log(`ParcelMap backend running on Fly.io at https://${process.env.FLY_APP_NAME}.fly.dev`);
  } else {
    console.log(`ParcelMap backend running on http://localhost:${PORT}`);
  }
  console.log(`Environment: ${ENV}`);
});
