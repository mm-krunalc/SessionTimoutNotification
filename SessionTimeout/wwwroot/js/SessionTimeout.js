var SessionTimeout = (function () {
    var timeoutSeconds;
    var warningSeconds;
    var secondsUntilWarning;
    var timeoutTimer;
    var warningTimer;
    var timer; // reference to the setInterval timer so it can be stopped
    var url;
    var startSessionTimer = function (sessionMinutes, sessionWarningMinutes, logoutUrl) {
        timeoutSeconds = sessionMinutes * 60;
        warningSeconds = sessionWarningMinutes * 60;
        secondsUntilWarning = timeoutSeconds - warningSeconds;
        url = logoutUrl;
        if (localStorage.getItem("timeAccessed")) {
            var timeAccessed = new Date(localStorage.getItem("timeAccessed"));
            var now = new Date();
            timeAccessed.setSeconds(timeAccessed.getSeconds() + timeoutSeconds);
            if (now > timeAccessed) {
                timeOut();
            }
        }
        localStorage.setItem("timeAccessed", new Date());
        timeoutTimer = setTimeout(timeOut, timeoutSeconds * 1000);
        warningTimer = setTimeout(openWarning, secondsUntilWarning * 1000);
    };

    var bindModalHideEvent = function (e) {
        $('#sessionTimeoutModal').on('hide.bs.modal', function () {
            resetTimer();
        });
    };

    function resetTimer() {
        localStorage.setItem("timeAccessed", new Date());
        localStorage.setItem("sessionTimeoutModal", "no");
        clearTimeout(timeoutTimer);
        clearTimeout(warningTimer);
        clearInterval(timer);
        $.ajax({
            url: '/Login/KeepAlive', // Redirects to action method for every 20 minutes.
            dataType: "json",
            type: "GET",
        });
        timeoutTimer = setTimeout(timeOut, timeoutSeconds * 1000);
        warningTimer = setTimeout(openWarning, secondsUntilWarning * 1000);
    }

    function timeOut() {
        window.location.href = url;
    }

    function openWarning() {
        var timeAccessed = new Date(localStorage.getItem("timeAccessed"));
        var now = new Date();
        timeAccessed.setSeconds(timeAccessed.getSeconds() + secondsUntilWarning);
        if (now >= timeAccessed) {
            localStorage.setItem("sessionTimeoutModal", "yes");
            $('#sessionTimeoutModal').modal('show');
            startCount();
            sendDecktopNotification();
        }
        else {
            resetTimer();
        }
    }

    function startCount() {
        // initialize timer
        var counter = warningSeconds;
        // initialize timer
        $('#timerInterval').html(counter);
        // create a timer that runs every second
        timer = setInterval(function () {
            counter -= 1
            if (counter > 0) {
                $('#timerInterval').html(counter);
            }
        }, 1000);
    }

    function sendDecktopNotification() {
        if (!window.Notification) {
            console.log('Browser does not support notifications.');
        } else {
            // check if permission is already granted
            if (Notification.permission === 'granted') {
                // show notification here
                var notify = new Notification('Hi there!', {
                    body: 'Your session is about to time out in ' + warningSeconds + ' seconds.',
                    icon: 'https://magnusminds.net/images/logo-horizontal.png',
                });
            } else {
                // request permission from user
                Notification.requestPermission().then(function (p) {
                    if (p === 'granted') {
                        // show notification here
                        var notify = new Notification('Hi there!', {
                            body: 'Your session is about to time out in ' + warningSeconds + ' seconds.',
                            icon: 'https://magnusminds.net/images/logo-horizontal.png',
                        });
                    } else {
                        console.log('User blocked notifications.');
                    }
                }).catch(function (err) {
                    console.error(err);
                });
            }
        }
    }

    return {
        StartSessionTimer: startSessionTimer,
        BindModalHideEvent: bindModalHideEvent
    };
}());