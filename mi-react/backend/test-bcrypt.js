const bcrypt = require('bcryptjs');
const password = 'jefe123';
const hash = '$2b$10$kMrn71Mrf4MHfnvG.2PCXOiLhF5KNBLxIG6uPt3w9SyYsWZaAhhVG'; // <-- reemplaza esto con el hash real
bcrypt.compare(password, hash, (err, res) => {
  if (err) console.error(err);
  else console.log('¿Coinciden?', res);
});