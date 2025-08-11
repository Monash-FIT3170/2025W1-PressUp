import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

export const FeedbackCollection = new Mongo.Collection('feedback');

FeedbackCollection.schema = new SimpleSchema({
    rating: {type: 'number',min:0,max:10},
    orderID: {type: 'string'},
    content: {type: 'string',optional:true},
    name: {type:'string',optional:true},
})