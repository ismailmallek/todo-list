import Mongoose from "mongoose";
import MongoosePaginate from "mongoose-paginate";

const commentSchema = new Mongoose.Schema({
    comment: String,
    createdAt: Date,
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
    createdAt: {
        required: true,
        type: Date,
    },
    description: {
        required: true,
        type: String,
    },
    updatedAt: {
        required: false,
        type: Date,
    },
    userId: {
        required: true,
        type: String,
    },
});

taskSchema.plugin(MongoosePaginate);

const Tasks = Mongoose.model("tasks", taskSchema);

export default Tasks;
