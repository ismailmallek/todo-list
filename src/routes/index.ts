import bodyParser from "body-parser";
import Express, {Request, Response} from "express";
import { isValidObjectId } from "mongoose";
import Tasks from "../model/tasks.model";

export const register = ( app: Express.Application ) => {
    const oidc = app.locals.oidc;
    let userId;
    // Middleware bodyParser to parse request in Json
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true,
    }));
    app.use (Express.static ("public"));
    app.use ("/css", Express.static (__dirname + "public/css"));
    app.use ("/js", Express.static (__dirname + "public/js"));

    // define a route handler for the default home page
    app.get( "/", ( req: any, resp ) => {
        const user = req.userContext ? req.userContext.userinfo : null;
        resp.render( "index", { isAuthenticated: req.isAuthenticated(), user } );
    } );

    // define a secure route handler for the login page that redirects to /todo-list
    app.get( "/login", oidc.ensureAuthenticated(), ( req: any, resp ) => {
        userId = req.userContext.userinfo.sub;
        resp.redirect( "/œ" );
    } );

    // define a route to handle logout
    app.get( "/logout", ( req: any, resp ) => {
        req.logout();
        resp.redirect( "/" );
    } );

    // define a secure route handler for the todo-list page
    app.get( "/todo-list", oidc.ensureAuthenticated(), ( req: any, resp ) => {
        userId = req.userContext.userinfo.sub;

        Tasks.find({}, (err, tasks) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.render( "todo-list",  {tasks}  );
            }
        });
    } );

    app.post("/addTask", ( req, resp ) => {
        const newTask = new Tasks({
            completed: false,
            createdAt: new Date(),
            description: req.body.description,
            userId: "userId",
        });
        Tasks.create(newTask, (err) => {
            if (err) {
                console.log(err.message);
                // resp.status(500).send(err.);
            } else {
                console.log("new task inserted");
            }
        });
        resp.redirect("/todo-list");
    });

    app.get( "/todo-list/:taskId", ( req: any, resp ) => {
        Tasks.findOne({_id: req.params.taskId}, (err, task) => {
            if (err) {
                console.log(err);
            } else {
                resp.render("edit-task", {
                    task,
                });
            }
        });
    } );

    app.post("/editTask/:taskId", ( req, resp ) => {
        const task = {
            description: req.body.description,
            updatedAt: new Date(),
        };

        Tasks.findByIdAndUpdate(req.params.taskId, task, (err) => {
            if (err) {
                console.log(err.message);
                // resp.status(500).send(err.);
            } else {
                console.log("task edited succefully");
            }
        });
        resp.redirect("/todo-list");
    });

    app.put("/markAsCompleted/:taskId", ( req, resp ) => {
        Tasks.findByIdAndUpdate(req.params.taskId, {completed: true}, (err) => {
            if (err) {
                console.log(err.message);
                // resp.status(500).send(err.);
            } else {
                console.log("task completed");
            }
        });
        resp.redirect("/todo-list");
    });

    app.delete("/deleteTask/:taskId", ( req, resp ) => {
        Tasks.deleteOne({_id: req.params.taskId}, (err) => {
            if (err) {
                console.log(err);
            }
        });
        resp.redirect("/todo-list");
    });
};
