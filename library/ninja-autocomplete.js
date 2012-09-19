/*!
##Begin Immediately-Invoked Function Expression

Assign `jQuery` to `$`.

Enable ECMAScript 5 strict mode.
*/
(function ($) {
  'use strict';

/*
##Autocomplete Constructor
*/

  $.Ninja.Autocomplete = function (element, options) {
    var autocomplete = this;

    if (element) {
      autocomplete.$element = $(element);
      if (!autocomplete.$element.is('input')) {
        $.ninja.error('Autocomplete may only be called with an <input> element.');
      }
    } else {
      $.ninja.error('Autocomplete must include an <input> element.');
    }

    autocomplete.$element.attr({
      autocomplete: 'off'
    }).removeAttr('list');

    autocomplete.$wrapper = autocomplete.$element.wrap('<span class="ninja-autocomplete">').parent();

    autocomplete.$list = $('<div>', {
      'class': 'ninja-list',
      css: {
        top: this.$wrapper.outerHeight()
      }
    });

    if (options) {
      if ('list' in options) {
        autocomplete.list = options.list;
      } else {
        autocomplete.list = [];
      }

      if ('get' in options) {
        autocomplete.get = options.get;
      }
    } else {
      $.ninja.error('Autocomplete called without options.');
    }

    autocomplete.index = -1;

    autocomplete.matchlist = [];

    autocomplete.$element.on('blur.ninja', function () {
      autocomplete.$list.remove();
    });

    autocomplete.$element.on('select.ninja', function () {
      autocomplete.$element.data('ninja-completed', true);
      autocomplete.$element.val(autocomplete.matchlist[autocomplete.index]);
      autocomplete.$list.remove();
    });

    autocomplete.$element.on('keydown.ninja', function (event) {
      var keycode = event.which;

      if ($.ninja.key(keycode, ['escape', 'tab'])) {
        autocomplete.$list.remove();
      } else if (keycode === $.ninja.keys.enter && autocomplete.index > -1) {
        autocomplete.$element.trigger('select.ninja');
      } else if ($.ninja.key(keycode, ['arrowDown', 'arrowUp'])) {
        if (autocomplete.index > -1) {
          autocomplete.$list.find('div:eq(' + autocomplete.index + ')').removeClass('ninja-hover');
        }

        if (keycode === $.ninja.keys.arrowDown) {
          if (autocomplete.index === autocomplete.last()) {
            autocomplete.index = 0;
          } else {
            autocomplete.index += 1;
          }
        } else {
          if (autocomplete.index <= 0) {
            autocomplete.index = autocomplete.last();
          } else {
            autocomplete.index -= 1;
          }
        }

        autocomplete.$list.find('div:eq(' + autocomplete.index + ')').addClass('ninja-hover');
      }
    });

    autocomplete.$element.on('focus.ninja, keyup.ninja', function (event) {
      if (autocomplete.$element.data('ninja-completed')) {
        autocomplete.$element.removeData('ninja-completed');
      } else {
        var keycode = event.which;

        if (!autocomplete.$element.val()) {
          autocomplete.$list.remove();
        } else if (!$.ninja.key(keycode, ['arrowDown', 'arrowUp', 'escape', 'tab'])) {
          if ($.isFunction(autocomplete.get)) {
            autocomplete.get(autocomplete.$element.val(), function (list) {
              autocomplete.list = list;

              autocomplete.suggest(list);
            });
          } else {
            autocomplete.suggest(autocomplete.list);
          }
        }
      }
    });

    autocomplete.$element.data('ninja', {
      autocomplete: options
    });

  };

/*
##Last

Determines position of the last available option.
*/
  $.Ninja.Autocomplete.prototype.last = function () {
    return this.matchlist.length - 1;
  };

/*
##List

Dynamically generates a list of options to display under the `<input>`.
*/
  $.Ninja.Autocomplete.prototype.suggest = function (list) {
    var autocomplete = this;

    if (!$.isFunction(autocomplete.get)) {
      autocomplete.matchlist = $.map(list, function (option) {
        var value = autocomplete.$element.val();

        if (value !== option && new RegExp('^' + value, 'i').test(option)) {
          return option;
        } else {
          return null;
        }
      });
    } else {
      autocomplete.matchlist = list;
    }

    autocomplete.$list.empty();

    if (autocomplete.matchlist.length > 0) {
      $.each(autocomplete.matchlist, function (i, option) {
        $('<div>', {
          'class': 'ninja-item',
          html: option
        }).on('mouseenter.ninja', function () {
          if (autocomplete.index > -1) {
            autocomplete.$list.find('div:eq(' + autocomplete.index + ')').removeClass('ninja-hover');
          }

          autocomplete.index = i;
        }).on('mousedown.ninja', function () {
          autocomplete.$element.trigger('select.ninja');
        }).on('mouseleave.ninja', function () {
          autocomplete.index = -1;
        }).appendTo(autocomplete.$list);
      });

      autocomplete.index = -1;

      autocomplete.$list.appendTo(autocomplete.$wrapper);
    }
  };

/*
Instance of Autcomplete constructor

Prevents multiple initialization.
*/
  $.ninja.autocomplete = function (element, options) {
    var $element = $(element);

    if ($element.data('ninja') && 'autocomplete' in $element.data('ninja')) {
      $.ninja.warn('Autocomplete called on the same element multiple times.');
    } else {
      $.extend(new $.Ninja(element, options), new $.Ninja.Autocomplete(element, options));
    }
  };

/*!
##End Immediately-Invoked Function Expression

Preserve jQuery's state while invoking.
*/
}(jQuery));
