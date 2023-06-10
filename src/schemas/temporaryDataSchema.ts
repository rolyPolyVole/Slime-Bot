import {Schema, model} from "mongoose";

const temporaryDataSchema = new Schema({
	_id: Schema.Types.ObjectId,
	type: String,
	data: Object,
	creationDate: Number,
	lifeSpan: Number,
});

export default model("Temporary Data", temporaryDataSchema, "Temporary Data");
