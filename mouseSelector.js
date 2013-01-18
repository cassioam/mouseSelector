(function ($) {
    $.mouseSelector = function (el, itemSelector, options) {
        
        var base = this;
        
        base.$el = $(el);
        base.el = el;
        var x0 = 0,
            y0 = 0,
            x1 = 0,
            y1 = 0,
            startPoint = { },
            $div = null,
            isDown = false;
        
        // Add a reverse reference to the DOM object
        base.$el.data("mouseSelector", base);

        var disableSelection = function() {
            base.$el.attr('unselectable', 'on')
                 .css('user-select', 'none')
                 .on('selectstart', false);
        };

        var createSelector = function(evt) {
            startPoint = { X: evt.pageX, Y: evt.pageY };

            $div = $('<div></div>')
                .mousemove(function (e) {
                    handleMove(e);
                });
            
            if(base.options.selectorCssClass !== '') {
                $div.addClass(base.options.selectorCssClass);
            }
            else {
                $div.css('background', 'rgba(5, 125, 255, 0.2)')
                    .css('border', 'solid 1px #0090FF');
            }

            $div.css('position', 'absolute').css('z-index', 9999);

            $('body').append($div);
        };


        var handleMove = function(evt) {

            if (isDown) {
                
                if (evt.pageX >= startPoint.X) {
                    x0 = startPoint.X;
                    x1 = evt.pageX;
                }
                else {
                    x1 = startPoint.X;
                    x0 = evt.pageX;
                }

                if (evt.pageY >= startPoint.Y) {
                    y0 = startPoint.Y;
                    y1 = evt.pageY;
                }
                else {
                    y1 = startPoint.Y;
                    y0 = evt.pageY;
                }

                drawSelector();
            }
        };

        var drawSelector = function() {
            var left = x0 >= x1 ? x1 : x0;
            var top = y0 >= y1 ? y1 : y0;
            var width = Math.abs(x0 - x1);
            var height = Math.abs(y0 - y1);

            $div.css('top', top + 'px').css('left', left + 'px').css('width', width + 'px').css('height', height + 'px');
        };

        var findIntersectors = function(targetSelector, intersectorsSelector) {
            var intersectors = [];

            //TODO: adjust values if parent zoom is different than 1

            var $target = $(targetSelector);
            var tAxis = $target.offset();
            var t_x = [tAxis.left, tAxis.left + $target.outerWidth()];
            var t_y = [tAxis.top, tAxis.top + $target.outerHeight()];

            $(intersectorsSelector).each(function() {
                var $this = $(this);
                var thisPos = $this.offset();
                var i_x = [thisPos.left, thisPos.left + $this.outerWidth()];
                var i_y = [thisPos.top, thisPos.top + $this.outerHeight()];

                if (t_x[0] < i_x[1] && t_x[1] > i_x[0] &&
                    t_y[0] < i_y[1] && t_y[1] > i_y[0]) {
                    intersectors.push($this);
                }

            });
            return intersectors;
        };

        base.init = function () {
            base.itemSelector = itemSelector;

            base.options = $.extend({}, $.mouseSelector.defaultOptions, options);

            
            disableSelection();

            base.$el.mousedown(function (evt) {

                var target = $(evt.target);

                if ($(base.itemSelector).has(target).length > 0 || target.is(base.itemSelector)) return;
                
                isDown = true;
                createSelector(evt);
            });

           
            $(document).mouseup(function () {
                isDown = false;
                if ($div != null) {

                    var selected = findIntersectors($div, base.itemSelector);
                    
                    $div.remove();
                    $div = null;

                    if(selected.length > 0 && base.options.onSelected !== undefined) {
                        options.onSelected(selected);
                    }
                }

            });

            base.$el.mousemove(function (evt) {
                handleMove(evt);
            });

        };
        
        base.init();
    };

    $.mouseSelector.defaultOptions = {
        selectorCssClass: '',
        
    };

    $.fn.mouseSelector = function (itemSelector, options) {
        return this.each(function () {
            (new $.mouseSelector(this, itemSelector, options));
        });
    };

})(jQuery);