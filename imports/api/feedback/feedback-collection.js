import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

export const FeedbackCollection = new Mongo.Collection('feedback');

FeedbackCollection.schema = new SimpleSchema({
    rating: {type: Number,min:0,max:10},
    orderID: {type: String},
    date: {type: Date},
    important: {type: Boolean,defaultValue:false},
    resolved: {type: Boolean,defaultValue:false},
    content: {type: String,optional:true},
    name: {type: String,optional:true},
})