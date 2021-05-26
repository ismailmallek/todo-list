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
        resp.redirect( "/" );
    } );

    // define a route to handle logout
    app.get( "/logout", ( req: any, resp ) => {
        req.logout();
        resp.redirect( "/" );
    } );

    // define a secure route handler for the todo-list page
    app.get( "/todo-list", oidc.ensureAuthenticated(), ( req: any, resp ) => {
        const user = req.userContext ? req.userContext.userinfo : null;
        userId = req.userContext.userinfo.sub;

        Tasks.find({}, (err, tasks) => {
            if (err) {
                resp.status(500).send(err);
            } else {
                resp.render( "todo-list",  {tasks, isAuthenticated: req.isAuthenticated(), user }  );
            }
        });
    } );

    app.post("/addTask", ( req: any, resp ) => {
        const newTask = new Tasks({
            completed: false,
            createdAt: new Date(),
            description: req.body.description,
            userId: req.userContext.userinfo.sub,
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

    app.get( "/todo-list/:taskId", oidc.ensureAuthenticated(), ( req: any, resp ) => {
        const user = req.userContext ? req.userContext.userinfo : null;
        userId = req.userContext.userinfo.sub;
        Tasks.findOne({_id: req.params.taskId, userId}, (err, task) => {
            if (err) {
                console.log(err);
            } else {
                resp.render("edit-task", {task, isAuthenticated: req.isAuthenticated(), user });
            }
        });
    } );

    app.post("/editTask/:taskId", ( req: any, resp ) => {
        const task = {
            description: req.body.description,
            updatedAt: new Date(),
        };
        console.log("userId edit: ", {_id: req.params.taskId, userId: req.userContext.userinfo.sub}, task);
        Tasks.updateOne(
            { userId: req.userContext.userinfo.sub, _id: req.params.taskId},
            task,
        ).then(() => {
            resp.redirect("/todo-list");
        })
        .catch((err) => {
            console.log("Error: " + err);
        });
    });

    app.put("/markAsCompleted/:taskId", ( req: any, resp ) => {
        Tasks.updateOne(
            {_id: req.params.taskId, userId: req.userContext.userinfo.sub},
            {completed: true,
            completedAt: new Date()},
        ).then(() => {
            resp.redirect("/todo-list");
        })
        .catch((err) => {
            console.log("Error: " + err);
        });
    });

    app.put("/markAsShared/:taskId", ( req: any, resp ) => {
        Tasks.updateOne(
            {_id: req.params.taskId, userId: req.userContext.userinfo.sub},
            {shared: true,
            sharedAt: new Date(),
            userName: req.userContext.userinfo.name},
        ).then(() => {
            resp.redirect("/todo-list");
        })
        .catch((err) => {
            console.log("Error: " + err);
        });
    });

    app.put("/markAsUnshared/:taskId", ( req: any, resp ) => {
        Tasks.updateOne(
            {_id: req.params.taskId, userId: req.userContext.userinfo.sub},
            {shared: false,
                sharedAt: undefined,
                userName: undefined},
        ).then(() => {
            resp.redirect("/todo-list");
        })
        .catch((err) => {
            console.log("Error: " + err);
        });
    });

    app.delete("/deleteTask/:taskId", ( req: any, resp ) => {
        Tasks.deleteOne({_id: req.params.taskId, userId: req.userContext.userinfo.sub}, (err) => {
            if (err) {
                console.log(err);
            }
        });
        resp.redirect("/todo-list");
    });

    app.get( "/shared-tasks", oidc.ensureAuthenticated(), ( req: any, resp ) => {
        const user = req.userContext ? req.userContext.userinfo : null;
        userId = req.userContext.userinfo.sub;

        Tasks.find(
            {shared: true},
            {description: 1, userId: 1, userName: 1, comments: 1},
        ).then((sharedTasks) => {
            const tasksDistributed = [];
            sharedTasks.forEach((sharedTask: any) => {
                const userIndex = tasksDistributed.findIndex((x) => x.userId === sharedTask.userId);
                if (userIndex >= 0) {
                    tasksDistributed[userIndex].tasks.push({_id: sharedTask._id, description: sharedTask.description, comments: sharedTask.comments});
                } else {
                    const task = {
                        tasks: [{_id: sharedTask._id, description: sharedTask.description, comments: sharedTask.comments}],
                        userId: sharedTask.userId,
                        userName: sharedTask.userName,
                    };
                    if (sharedTask.userId === userId) {
                        tasksDistributed.unshift(task);
                    } else {
                        tasksDistributed.push(task);
                    }
                }
            });
            resp.render( "shared-tasks",  {sharedTasks: tasksDistributed, isAuthenticated: req.isAuthenticated(), user }  );
        })
        .catch((err) => {
            console.log("Error: " + err);
            resp.status(500).send(err);
        });
    });

    app.post("/addComment", ( req: any, resp ) => {
        const comment = {
            comment: req.body.comment,
            createdAt: new Date(),
            userId: req.userContext.userinfo.sub,
            userName: req.userContext.userinfo.name,
        };

        console.log("comment", comment);

        Tasks.updateOne(
            { _id: req.body.taskId},
            { $addToSet: { comments: [comment] } },
        ).then((res) => {
            console.log("ressss: ", res);
            resp.redirect("/shared-tasks");
        })
        .catch((err) => {
            console.log("Error: " + err);
        });
    });

};
