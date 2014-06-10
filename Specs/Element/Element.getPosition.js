/*
---
name: Element.Dimensions
requires: ~
provides: ~
...
*/

describe('Element.Dimensions', function () {

	// http://jsfiddle.net/sr4g9/
	var div = new Element('div', {
		id: 'wrapper',
		styles: {
			border: '1px solid black',
			display: 'block',
			position: 'absolute',
			top: 100,
			left: 300
		}
	}).inject($(document.body));
	var inner = new Element('div', {
		id: 'inner',
		styles: {
			width: '50%',
			height: '50%',
			display: 'block',
			position: 'absolute',
			top: '25%',
			left: '25%',
			backgroundColor: '#88a'
		}
	}).inject(div);

	var specResult = 0;
	var wrapper = $('wrapper'),
		inner = $('inner'),
		dimentions = 10,
		step = 0,
		int,
		consistent = ['10 - 2', '11 - 2', '12 - 3', '13 - 3', '14 - 3', '15 - 3', '16 - 4', '17 - 4', '18 - 4', '19 - 4', '20 - 5', '21 - 5', '22 - 5', '23 - 5', '24 - 6', '25 - 6', '26 - 6', '27 - 6', '28 - 7', '29 - 7', '30 - 7', '31 - 7', '32 - 8', '33 - 8', '34 - 8', '35 - 8', '36 - 9', '37 - 9', '38 - 9', '39 - 9', '40 - 10', '41 - 10', '42 - 10', '43 - 10', '44 - 11', '45 - 11', '46 - 11', '47 - 11', '48 - 12', '49 - 12', '50 - 12'];

	it('Should measure properly the relative position of a centered element', function () {

		function resize() {
			wrapper.setStyles({
				width: dimentions * 4,
				height: dimentions
			});
			var pos = inner.getPosition(wrapper);
			
			expect(pos.x + ' - ' + pos.y).toEqual(consistent[step]);
			dimentions++;
			step++;
			if (dimentions > 50) clearInterval(int);
		}
		int = setInterval(resize, 100);
		waits(6000);
	});

});
