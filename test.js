var noDB = require("./dist/index.js").default;

noDB.getInstance().deleteFile("test2");

// noDB.getInstance().createFile("test2", {
// 	name: "idx",
// 	type: "number",
// 	primary: true,
// }, {
// 	name: "text",
// 	type: "string",
// });

// noDB.getInstance().insertData("test2", {
// 	idx: 1,
// 	text: "test1",
// }, {
// 	idx: 2,
// 	text: "test2",
// });

// noDB.getInstance().updateData("test2", {
// 	idx: 2,
// 	text: "test3",
// });

// noDB.getInstance().deleteData("test2", {
// 	idx: 1,
// });
