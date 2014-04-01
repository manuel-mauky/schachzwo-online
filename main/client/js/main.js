
requirejs.config({
    paths: {
        "jquery" : [
            "https://code.jquery.com/jquery-2.1.0.min",
            "libs/jquery-2.1.0.min"
        ],
        "bootstrap" : [
            "libs/bootstrap.min"
        ]
    }
});

require(["jquery","bootstrap","schachzwo"]);
