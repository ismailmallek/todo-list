import Mongoose from "mongoose";
import MongoosePaginate from "mongoose-paginate";

const commentSchema = new Mongoose.Schema({
    comment: String,
    createdAt: Date,
    userId: String,
    userName: String,
});

const taskSchema = new Mongoose.Schema({
    comments: {
        default: undefined,
        required: false,
        type: [commentSchema],
    },
    completed: {
        required: true,
        type: Boolean,
    },
    completedAt: {
        required: false,
        type: Date,
    },
    createdAt: {
        required: true,
        type: Date,
    },
    description: {
        required: true,
        type: String,
    },
    shared: {
        required: false,
        type: Boolean,
    },
    sharedAt: {
        required: false,
        type: Date,
    },
    updatedAt: {
        required: false,
        type: Date,
    },
    userId: {
        required: true,
        type: String,
    },
    userName: {
        required: false,
        type: String,
    },
});

taskSchema.plugin(MongoosePaginate);

const Tasks = Mongoose.model("tasks", taskSchema);

export default Tasks;
