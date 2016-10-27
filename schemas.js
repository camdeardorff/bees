/**
 * Created by Cam on 10/9/16.
 */

optVal = "opt";

schemas = {
	opt: optVal,
	soundRecord: {
		id: optVal,
		sample_time: null,
		record_time: null,
		decibels: null
	},
	soundAverage: {
		id: optVal,
		fromTime: null,
		toTime: null,
		average: null
	}

};

schemas.validateDataWithSchema = function (data, schema) {
	if (!data || !schema) {
		return {valid: false, missingProperty: null};
	} else {
		//get the coupon from the schemas
		var optVal = this.opt;
		//loop over every property from the schema
		for (var property in schema) {
			//check for a non default property in both the schema and data
			if (schema.hasOwnProperty(property) && schema[property] !== optVal) {
				if (!data.hasOwnProperty(property)) {
					//doesn't have the property. return the property
					return {valid: false, missingProperty: property};
				} else if (data.hasOwnProperty(property) && data[property] === null) {
					//the data has the property but it is null. return the property
					return {valid: false, missingProperty: property};
				}
			}
		}
		return {valid: true, missingProperty: null};
	}
};

module.exports = schemas;