function App() {
    this.popover = new Popover(this);
    this.markdown = new Markdown();
    this.sidebar = new Sidebar();
    this.search = new Search();
    this.tooltip = new Tooltip(this);
    this.swimlane = new Swimlane();
    this.keyboardShortcuts();
    this.boardSelector();
    this.listen();
    this.poll();

    // Alert box fadeout
    $(".alert-fade-out").delay(4000).fadeOut(800, function() {
        $(this).remove();
    });

    // Reload page when a destination project is changed
    var reloading_project = false;
    $("select.task-reload-project-destination").change(function() {
        if (! reloading_project) {
            $(".loading-icon").show();
            reloading_project = true;
            window.location = $(this).data("redirect").replace(/PROJECT_ID/g, $(this).val());
        }
    });
}

App.prototype.listen = function() {
    $(document).off();

    this.popover.listen();
    this.markdown.listen();
    this.sidebar.listen();
    this.tooltip.listen();
    this.search.listen();
    this.search.focus();
    this.taskAutoComplete();
    this.datePicker();
    this.focus();

    // Dropdown
    $(".dropit-submenu").hide();
    $('.dropdown').not(".dropit").dropit({ triggerParentEl : "span" });
};

App.prototype.focus = function() {

    // Autofocus fields (html5 autofocus works only with page onload)
    $("[autofocus]").each(function(index, element) {
        $(this).focus();
    })

    // Auto-select input fields
    $(document).on('focus', '.auto-select', function() {
        $(this).select();
    });

    // Workaround for chrome
    $(document).on('mouseup', '.auto-select', function(e) {
        e.preventDefault();
    });
};

App.prototype.poll = function() {
    window.setInterval(this.checkSession, 60000);
};

App.prototype.keyboardShortcuts = function() {
    // Submit form
    Mousetrap.bindGlobal("mod+enter", function() {
        $("form").submit();
    });

    // Open board selector
    Mousetrap.bind("b", function(e) {
        e.preventDefault();
        $('#board-selector').trigger('chosen:open');
    });
};

App.prototype.checkSession = function() {
    if (! $(".form-login").length) {
        $.ajax({
            cache: false,
            url: $("body").data("status-url"),
            statusCode: {
                401: function() {
                    window.location = $("body").data("login-url");
                }
            }
        });
    }
};

App.prototype.datePicker = function() {
    // Datepicker translation
    $.datepicker.setDefaults($.datepicker.regional[$("body").data("js-lang")]);

    // Datepicker
    $(".form-date").datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: 'yy-mm-dd',
        constrainInput: false
    });

    // Datetime picker
    $(".form-datetime").datetimepicker({
        controlType: 'select',
        oneLine: true,
        dateFormat: 'yy-mm-dd',
        // timeFormat: 'h:mm tt',
        constrainInput: false
    });
};

App.prototype.taskAutoComplete = function() {
    // Task auto-completion
    if ($(".task-autocomplete").length) {

        if ($('.opposite_task_id').val() == '') {
            $(".task-autocomplete").parent().find("input[type=submit]").attr('disabled','disabled');
        }

        $(".task-autocomplete").autocomplete({
            source: $(".task-autocomplete").data("search-url"),
            minLength: 1,
            select: function(event, ui) {
                var field = $(".task-autocomplete").data("dst-field");
                $("input[name=" + field + "]").val(ui.item.id);

                $(".task-autocomplete").parent().find("input[type=submit]").removeAttr('disabled');
            }
        });
    }
};

App.prototype.boardSelector = function() {
    $(".chosen-select").chosen({
        width: "200px",
        no_results_text: $(".chosen-select").data("notfound"),
        disable_search_threshold: 10
    });

    $("#board-selector").chosen({
        width: 180,
        no_results_text: $("#board-selector").data("notfound")
    });

    $("#board-selector").change(function() {
        window.location = $(this).attr("data-board-url").replace(/PROJECT_ID/g, $(this).val());
    });
};

App.prototype.showLoadingIcon = function() {
    $("body").append('<span id="app-loading-icon">&nbsp;<i class="fa fa-spinner fa-spin"></i></span>');
};

App.prototype.hideLoadingIcon = function() {
    $("#app-loading-icon").remove();
};

App.prototype.isVisible = function() {
    var property = "";

    if (typeof document.hidden !== "undefined") {
        property = "visibilityState";
    } else if (typeof document.mozHidden !== "undefined") {
        property = "mozVisibilityState";
    } else if (typeof document.msHidden !== "undefined") {
        property = "msVisibilityState";
    } else if (typeof document.webkitHidden !== "undefined") {
        property = "webkitVisibilityState";
    }

    if (property != "") {
        return document[property] == "visible";
    }

    return true;
};

App.prototype.formatDuration = function(d) {
    if (d >= 86400) {
        return Math.round(d/86400) + "d";
    }
    else if (d >= 3600) {
        return Math.round(d/3600) + "h";
    }
    else if (d >= 60) {
        return Math.round(d/60) + "m";
    }

    return d + "s";
};
