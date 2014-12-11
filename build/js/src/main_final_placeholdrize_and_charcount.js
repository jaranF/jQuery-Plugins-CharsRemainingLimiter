/**
 * Created by jaranf on 26/11/2014.
 * Characters Input Limiter And Countdown plugin
 */
(function ($) {
    $.fn.observeCharCount = function (options) {
    //SUPPLIED WITHOUT EXCEPTIONS ALREADY
    //This is the easiest way to have default options.
        var opts = $.extend({
            limit: 12,
            preLimitWarn: 5
        }, options),
            l = opts.limit,
            sRemainingClassName = ".charsRemaining",
            pLW = opts.preLimitWarn;

        function getCaretPosition(oField) {
            var iCpos = 0,
                oSel; // Initialize

            // IE Support
            if (document.selection) {
                // To get cursor position, get empty selection range
                oSel = document.selection.createRange();

                // Move selection start to 0 position
                oSel.moveStart('character', -oField.value.length);
                // The caret position is selection length
                iCpos = oSel.text.length;
            } else if (oField.selectionStart || oField.selectionStart === '0') {
                iCpos = oField.selectionStart;
            } //End if..elseif document.selection vs 'selectionStart'

            return iCpos;
        } //end function

        function getClipboardText(obj) {
            var s = "", oCBD;
            oCBD = !!obj.clipboardData ? obj.clipboardData : !!window.clipboardData ? window.clipboardData : false;
            if (oCBD) {
                s = oCBD.getData("text");
            }
            return s;
        } // end function

        function updateCharsRemaining(oEl, iRemaining) {
            var $el = $(oEl);

            $el.siblings(sRemainingClassName).find("span").text(iRemaining);
            if (iRemaining <= pLW) {
                $el.siblings(sRemainingClassName).addClass("is-warn-nearLimit");
            } else {
                $el.siblings(sRemainingClassName).removeClass("is-warn-nearLimit");
            }
        } // end function


        this.each(
            function () {
                //Account for the current value of the input field being just the default placeholder text. If so then don't reduce the limit by X chars; Else do.
                var initialCharsRemaining = this.value === this.getAttribute("data-placeholder") || this.value === this.getAttribute("placeholder") ? l : l - this.value.length;
                updateCharsRemaining(this, initialCharsRemaining);

                $(this).bind("keydown", function (e) {
                    //inscope via closure
                    //l                   {integer} the limit for maximum chars allowed
                    var iCTlen,
                        bHasReachedCharLimit = false,
                        iKC;
                    iCTlen = this.value.length;
                    iKC = e.keyCode;


                    //The below traps cursor movement on the ibeam input caret and also shift, alt keydowns because we know that when
                    //the keypress event is complete as a whole that these non-printing chars will not make 'iCTlen' larger by one. In
                    //otherwords if the keypress just about to be completed after this keyup results in a non-printing char then
                    //make sure the 'charsRemaining' number isn't decremented.
                    iCTlen += iKC === 46 || iKC === 8 || iKC === 16 || iKC === 93 || iKC === 91 || iKC === 17 || iKC === 18 || (iKC >= 37 && iKC <= 40) ? 0 : 1;

                    //Otherwise if a delete or backspace keypress detected allow for charsRemaining to be incremented. Why? Because by deleting
                    //from the present text string we come one character further away from reaching the limit so 'charsRemaining' is incremented.

                    if ((iKC === 46 || iKC === 8) && iCTlen > 0) { //Note we don't allow this if clause to increment 'charsRemaining' if there is nothing to delete i.e.  The current input's length HAS to be greater than zero.
                        iCTlen -= 1;
                    }

                    if (iCTlen > l) {
                        this.value = this.value.substring(0, l);
                        updateCharsRemaining(this, 0);
                        bHasReachedCharLimit = true;
                    } else {
                        updateCharsRemaining(this, l - iCTlen);
                    }
                    return !bHasReachedCharLimit;  //A 'return' statement like this returning a boolean can be a jQuery shortcut for 'stopPropagation' and 'preventDefault'.
                }).bind("paste", function (e) {
                    //inscope via closure
                    //l                   {integer} the limit for maximum chars allowed
                    var sPasteData,
                        iPDlen,
                        iCaretPos,
                        sCurrentText = this.value,
                        iCTlen;
                    iCTlen = sCurrentText.length;
                    sPasteData = getClipboardText(e.originalEvent);
                    iPDlen = sPasteData.length;
                    if ((iCTlen + iPDlen) > l) {
                        // say pasteData = Lorem
                        //        iPDlen = 5

                        // sCurrentText = a 2 3 4 5 6 7 8 L o r e m
                        //                0 1 2 3 4 5 6 7 8 9 0 1 2

                        // SCENARIO 2
                        // sCurrentText = a 2 3 4 5 6 7
                        //                0 1 2 3 4 5 6   = length 7
                        // say pasteData = Lore and cursor pos is at 2 when pasted in
                        // expect
                        // Before               a 2 3 4 5 6 7
                        //                      0 1 2 3 4 5 6

                        // IF pasteData was just 'Lor' then we wouldn't trip the length with pasted data > maxLimit so we don't have to worry about the cursor position and the native browser UI can deal with the paste.
                        // BUT if sPasteData = 'Lore' and we only have space for a 3 char string from the clipboard
                        // EXPECT
                        // After                a 2 L o r 3 4 5 6 7
                        //                      0 1 2 3 4 5 6 7 8 9 = length 10
                        // l - 7 = 3 (allowed to be pasted from clipboard = Lor)
                        iCaretPos = getCaretPosition(this);
                        sCurrentText = sCurrentText.substring(0, iCaretPos) + sPasteData.substring(0, Math.max(0, l - iCTlen)) + sCurrentText.substring(iCaretPos, iCTlen);
                        this.value = sCurrentText;
                        updateCharsRemaining(this, 0);
                        return false;
                    }
                    updateCharsRemaining(this, l - (iCTlen + iPDlen));
                }).bind("keyup", function (e) {
                    if (e.keyCode === 46 || e.keyCode === 8) {
                        updateCharsRemaining(this, l - this.value.length);
                    }
                }); //end key event bindings
            }
        ); //End each()

        return this;
    };
}(jQuery));

/**
 * Created by jaranf on 06/12/2014.
 * Characters Input Limiter And Countdown plugin
 */
(function ($) {
    $.fn.placeholderize = function (options) {
        var opts = $.extend({
            placeholderColor: "#999"
        }, options);
        this.each(
            function () {
                var _t = this;
                _t.value = _t.getAttribute("data-placeholder");
                $(_t).bind("focus", function (e) {
                    if (this.value === this.getAttribute("data-placeholder")) {
                        this.value = "";
                        this.style.color = "";
                    }
                }).bind("blur", function (e) {
                    if (this.value === "") {
                        this.value = this.getAttribute("data-placeholder");
                        this.style.color = opts.placeholderColor;
                    }
                });

                _t.style.color = opts.placeholderColor;
            }
        ); //End each()
        return this;
    };
}(jQuery));

/**
 * ****************************************************************************
 * *** M A I N    D O M C O N T E N T    L O A D E D    P A G E    C O D E  ***
 * ****************************************************************************
 */

$(function () {
    var sDS = document.location.search, iLimit = 240;
    if (/^[&?]charLimit=(\d{1,2})/.test(sDS)) {
        iLimit = sDS.replace(/^[&?]charLimit=(\d{1,2})/, "$1");
    }
    $("textarea").placeholderize().observeCharCount({limit: iLimit});
    $("#msgAlignment").click(function (e) {
        if (e.target.name === "choseAlignment") {
            $("textarea").attr("dir", e.target.value);
        }
    });
});

