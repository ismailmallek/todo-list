import dotenv from "dotenv";
import Express from "express";
import Mongoose from "mongoose";
import path from "path";
import * as sessionAuth from "./middleware/sessionAuth";
import * as routes from "./routes";

// initialize configuration
dotenv.config();

// port is now available to the Node.js runtime
// as if it were an environment variable
const port = process.env.SERVER_PORT;

const app = Express();

const uri: string = "mongodb://localhost:27017/todo-list";
Mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false }, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Mongodb connection success");
  }
});

// Configure Express to use EJS
app.set( "views", path.join( __dirname, "views" ) );
app.set( "view engine", "ejs" );

// Configure session auth
sessionAuth.register( app );

// Configure routes
routes.register( app );

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );
