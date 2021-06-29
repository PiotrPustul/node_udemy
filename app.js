const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
// const mongoConnect = require('./util/database').mongoConnect; // nie uzywamy przy mongoose
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://piotrek:mongo123@cluster0.ayjah.mongodb.net/shop';

const app = express();
const store = new MongoDBStore({
   uri: MONGODB_URI,
   collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
   session({
      secret: 'my secret',
      resave: false,
      saveUninitialized: false,
      store: store
   })
);

app.use((req, res, next) => {
   if (!req.session.user) {
      return next();
   }

   User.findById(req.session.user._id)
      .then(user => {
         req.user = user;
         next()
      })
      .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
   .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
   .then(result => {
      // -------------- Tworzymy uzytkownika gdy nie mamy mozliwosci zalozenia konta na stronie
      // User.findOne()
      // .then(user => {
      //    if (!user) {
      //       const user = new User({
      //          name: 'Piotr',
      //          email: 'test@test.pl',
      //          cart: {
      //             items: []
      //          }
      //       });
      //       user.save();
      //    }
      // });
      app.listen(3000);
   })
   .catch(err => {
      console.log(err);
   });


// mongoConnect(() => {
//    app.listen(3000);  // nie uzywamy z mongoose, tak samo jak pliku database gdzie mongoDB musialo sie polaczyc
// });
