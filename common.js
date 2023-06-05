Error.prototype.alert = function() {
	alert(`${this.fileName}:${this.lineNumber}:${this.columnNumber} ${this.toString()}`);
};

const points_fn_obj = {
	'Ποδόσφαιρο': (sh, sa) => {
		if (sh > sa)
			return [3, 0];
		else if (sh < sa)
			return [0, 3];
		else
			return [1, 1];
	},
	'Μπάσκετ': (sh, sa) => {
		if (sh > sa)
			return [2, 1];
		else if (sh < sa)
			return [1, 2];
		else
			throw 'ισοπαλία στο μπάσκετ;';
	},
};
