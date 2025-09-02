
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
export const TrainingModules = new Mongo.Collection('training_modules');

TrainingModules.schema = new SimpleSchema({
    title: { type: String },
    description: { type: String },
    duration: { type: Number }, // in minutes
    link: { type: String, optional: true }, // URL to video/doc
})

