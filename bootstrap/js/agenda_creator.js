// Creates the agenda's UI from a JSON object
(function() {
    var $PAGE = $('.page-wrapper'),
        $AGENDA_CONTAINER = $('<div class="container agenda-container"></div>');
    
    /**
     * Formats a date object into the following: Friday, April 23
     * @param {DateObject} date
     * @return {String} Formatted date string
     */
    var formatDateString = function(date) {
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        return days[date.getDay()] + ', ' + months[date.getMonth()] + ' ' + date.getDate();
    };

    /**
     * Formats positional number: 1st 2nd 3rd 4th etc.
     * @param {Integer} number
     * @return {String} Formatted positional number
     */
    var formatPositionalNumber = function(number) {
        if (number === 1) {
            return "1st";
        } else if (number === 2) {
            return "2nd";
        } else if (number === 3) {
            return "3rd";
        }

        // default return
        return number + "th";
    }

    /**
     * Create the navigation element that goes up to the top of the screen
     * @param {Object} element The jQuery DOM object to attach the top navigator to
     */
    var createTopNavigator = function(element) {
        var $div = $('<div class="top-navigation"></div>');

        element
            .append($div
                .append($('<p>Top <span class="glyphicon glyphicon-chevron-up"></span></p>'))
            );
    };

    /**
     * Adds day to top to navigation
     * @param {DateObject} date Date of the new day to add to agenda
     * @param {Integer} dayNumber Number indicating which day of the conference the agenda is on
     * @param {Object} element The DOM element to add the navigation button to
     */
    var addAgendaDayNavigation = function(date, dayNumber, element) {
        // console.log('element', element);
        // console.log('element children', element.children());
        // console.log('element chidlren length', element.children().length);
        var dateString,
            colSize = 12 / dayNumber,
            currentNavigationButtons = element.children();

        dateString = formatDateString(date);

        // Resize current buttons to accomodate new button
        currentNavigationButtons.each(function() {
            $(this).removeClass();
            $(this).addClass('col-sm-' + colSize);
        });
        
        element
            .append($('<div class="col-sm-' + colSize + '"></div>')
                .append($('<a href="#'+formatPositionalNumber(dayNumber)+'-day" class="btn btn-block btn-lg btn-info btn-agenda-day">' + dateString + '</a>'))
        );
    };

    /**
     * Creates a new table to house another day on the agenda
     * @param {DateObject} date The date of the new day to add to the schedule
     * @param {Object} element The DOM element to add the navigation button to
     * @return {jQuery Object} The DOM element of the table body
     */
    var createAgendaDay = function(date, dayNumber, element) {
        var $agendaDayTable = $('<table class="table table-striped table-hover agenda-table"></table>'),
            $agendaDayTableBody = $('<tbody>');
        
        // add date header above table
        element.append($('<a id="' + formatPositionalNumber(dayNumber) + '-day" class="anchor"></a>'));
        element.append(
            $('<div class="agenda-day"></div>').append(
                $('<h2 class="page-header">' + formatDateString(date) + '</h2>')
            )
        );

        // Create basic table structure with thead and tbody
        element.append($agendaDayTable);
        $agendaDayTable.append(
            $('<thead>').append(
                $('<tr>').append(
                    $('<th>Time</th>')
                ).append(
                    $('<th>Event</th>')
                )
            )
        );
        $agendaDayTable.append($agendaDayTableBody);

        // Create table body scaffold and return to be filled later
        return $agendaDayTableBody;
    };

    /**
     * Creates a normal agenda event in the overall agenda table
     * @param {Object} event The object containing the event information
     * @param {Object} element The DOM element to attach the event to
     * @param {Function} createTimeCb Function returning the html element <td> for the event time, expects event object
     * @param {Function} createInfoCb Function returning the HTML element <td> for the event info/detail, expects event object
     */
    var createEventRow = function(event, element, createTimeCb, createInfoCb) {
        var $timeCol,
            $infoCol;

        // Time portion
        $timeCol = createTimeCb(event);

        // info column
        $infoCol = createInfoCb(event);

        element.append(
            $('<tr>').append($timeCol).append($infoCol)
        );
    };


    /**
     * Formats the event time for all events (all events have the same HTML format)
     * @param {Object} event The object containing the event information
     */
    var createEventTimeHtml = function(event) {
        var $eventTimeHtml = $('<td></td>');

        eventTimeHtml = event.time;
        if (event.apsa) {
            eventTimeHtml += ' <i class="fa fa-user-md"></i>';
        }

        return $eventTimeHtml.html(eventTimeHtml);
    };

    /**
     * Creates a description for an event
     * @param {Object} event The object containing the event information
     * @return {jQuery DOM Object} The jquery description object to attach to the event
     */
    var createEventDescription = function(event) {
        var $moreLessDiv = $('<div class="more-less"></div>'),
            $description = $('<p class="collapse"></p>'),
            $moreLessButton = $('<p></p>'),
            randomId;

        randomId = Math.floor((Math.random() * 1000000) + 1);

        $description.attr('id', randomId);
        $description.html(event.description);

        $moreLessButton.append(
            $('<a data-toggle="collapse" href="#' + randomId + '" aria-expanded="false" aria-controls="issues-panel">More</a>')
        );

        $moreLessDiv.append($description);
        $moreLessDiv.append($moreLessButton);

        return $moreLessDiv;
    };

    /**
     * Formats the info for a normal event
     * @param {Object} event  The object containing the event information
     */
    var createNormalEventInfoHtml = function(event) {
        var $eventInfoHtml = $('<td>'),
            eventLocation = event.location || "TBA";

        $eventInfoHtml.append($('<p><strong>' + event.title + '</strong></p>'));
        $eventInfoHtml.append($('<p>Location: <em>' + eventLocation + '</em></p>'));

        if (event.description) {
            $eventInfoHtml.append(createEventDescription(event));
        }

        return $eventInfoHtml;
    };

    
    /**
     * Formats the event info for a session event
     * @param {Object} event The object containing all information for a single event
     */
    var createSessionEventInfo = function(event) {
        var $eventInfoHtml = $('<td>'),
            moderators = '',
            eventLocation = event.location || "TBA";

        $eventInfoHtml.append($('<p><strong>' + event.title + '</strong></p>'));
        if (event.moderators && event.moderators.length > 0) {
            for (var i = 0; i < event.moderators.length; i++) {
                if (i < event.moderators.length - 1) {
                    moderators += event.moderators[i] + ', ';
                } else {
                    moderators += event.moderators[i];
                }
            }
        }

        $eventInfoHtml.append($('<p>Session Moderators: ' + moderators + '</p>'));
        $eventInfoHtml.append($('<p>Location: <em>' + eventLocation + '</em></p>'));

        return $eventInfoHtml;
    };

    /**
     * Creates the table cell for keynote event information to be added to a keynote row in the schedule
     * @param {Object} event Object containing all event information
     * @return {jQuery DOM Object} The DOM object containing the keynote event info
     */
    var createKeynoteEventInfo = function(event) {
        var $eventInfoHtml = $('<td>'),
            $speakerRow = $('<div class="row"></div>'),
            eventLocation = event.location || "TBA";

        // presentation might be an award and should have award title added
        if (event.award) {
            $eventInfoHtml.append($('<p><strong>' + event.award + '</strong></p>'));
        }
        
        // keynotes might not have a global title
        if (event.title) {
            $eventInfoHtml.append($('<p><strong>' + event.title + '</strong></p>'));
        }


        // Events with one speaker
        if (event.speaker.length === 1) {
            $eventInfoHtml.append(createSpeakerInfo(event.speaker[0]));

        // events with multiple speakers
        } else if (event.speaker.length > 1) {
            $eventInfoHtml.append($speakerRow);
            for (var i = 0; i < event.speaker.length; i++) {
                $speakerRow.append(
                    $('<div class="col-sm-6"></div>').append(
                        createSpeakerInfo(event.speaker[i])
                    )
                );
            }
        }

        $eventInfoHtml.append($('<p>Location: <em>' + eventLocation + '</em></p>'));

        return $eventInfoHtml;
    };

    /**
     * Creates all of the speaker information including image, links, talk title, and name; NO location
     * @param {Object} speaker The single object that contains the speaker information 
     * @return {jQuery DOM Object} The DOM object containing the speaker information
     */
    var createSpeakerInfo = function(speaker) {
        var $speaker = $('<div>'),
            $imgDiv = $('<div class="pull-left"></div>'),
            $infoDiv = $('<div class="keynote-info"></div>'),
            $speakerImg,
            $speakerLink,
            $speakerName,
            speakerType = speaker.speaker_type || "Invited Speaker";

        $speakerLink = $('<a href="../speakers/#' + createSpeakerId(speaker.name) + '"></a>');
        $speakerName = $('<p><strong>' + speakerType + '</strong>: ' + speaker.name + '; ' + speaker.affiliation + '</p>');

        // speaker image might not be available immediately
        if (speaker.agenda_image) {
            $speaker.append($imgDiv);
            $speakerImg = $('<img src="../images/keynotes/' + speaker.agenda_image + '" class="keynote-thumbnail img-thumbnail" />');

            // only create the link if the bio exists because the bio page won't exist without a bio
            if (speaker.bio) {
                $imgDiv.append(
                    $speakerLink.append(
                        $speakerImg
                    )
                )
            } else {
                $imgDiv.append($speakerImg);
            }
        }

        // attach info div AFTER the possibility of attaching the image div
        $speaker.append($infoDiv);

        // if the speaker has provided a title
        if (speaker.title) {
            $infoDiv.append($('<p><strong>' + speaker.title + '</strong></p>'));
        }

        // Again, only add link if the speaker's bio exists
        if (speaker.bio) {
            $infoDiv.append(
                $speakerLink.append(
                    $speakerName
                )
            );
        } else {
            $infoDiv.append($speakerName);
        }

        // if a speaker has a specified time outside the global event time
        // useful for multi-speaker events
        if (speaker.time) {
            $infoDiv.append('<p>Time: <em>' + speaker.time + '</em></p>');
        }

        return $speaker;
    };

    /**
     * Creates a quicky ID for DOM for the speaker for use as an anchor in HTML
     * @param {String} speakerName The name of the speaker
     */
    var createSpeakerId = function(speakerName) {
        return speakerName
            ? speakerName.toLowerCase().replace(/ |, |\./g, '-')
            : '';
    };

    /**
     * Creates a panel event on the agenda
     * @param {Object} event The object containing all of the event information
     * @return {jQuery DOM Object} Returns the DOM object of the table cell containing the panel info
     */
    var createPanelEventInfo = function(event) {
        var $eventInfoHtml = $('<td>'),
            participant,
            eventLocation = event.location || 'TBA';

        // add event title
        $eventInfoHtml.append(
            $('<a href="../panels/#' + createPanelId(event.title) + '"></a>').append(
                $('<p><strong>APSA Panel: ' + event.title + '</strong></p>')
            )
        );

        for (var i = 0; i < event.participant.length; i++) {
            participant = event.participant[i];
            $eventInfoHtml.append(createPanelParticipant(participant, participant.moderator));
        }

        $eventInfoHtml.append($('<p>Location: <em>' + eventLocation + '</em></p>'));

        return $eventInfoHtml;
    };

    /**
     * Creates the bubble image and name for displaying a panel participant on the schedule
     * @param {Object} participant Contains all information on a single panel participant
     * @param {Boolean} moderator Determines whether or not the participant is a moderator
     * @return {jQuery DOM Object} The div containing the participant DOM object to be displayed
     */
    var createPanelParticipant = function(participant, moderator) {
        var $participant = $('<div class="bubble-sm"></div>'),
            $participantLink,
            bubbleImageClasses = "bubble-image",
            participantNameString = participant.name;

        $participantLink = $('<a href="../panels/#' + createSpeakerId(participant.name) + '"></a>');

        $participant.append($participantLink);

        // if participant is indicated to be a moderator
        if (moderator) {
            bubbleImageClasses = "bubble-image panel-moderator";
            participantNameString = 'Moderator: ' + participantNameString;
        }

        // add bubble image and participant name string (based on whether they are a moderator or not)
        $participantLink.append($('<div class="' + bubbleImageClasses + '" style="background-image: url(../images/panels/' + participant.agenda_image + ');"></div>'));
        $participantLink.append($('<p>' + participantNameString + '</p>'));

        return $participant;
    }

    /**
     * Creates an ID for an HTML anchor of the panel
     * @param {String} panelName The name of the panel
     */
    var createPanelId = function(panelName) {
        return panelName.toLowerCase().replace(/ |, |\./g, '-');
    }

    // Create Agenda
    $(document).ready(function() {
        $.getJSON('../../meeting_info/meeting_info.json', function(events) {
            // console.log(events);
            if (events.length === 0) {
                $PAGE.append($('p', {class: "lead text-center"}).text('Coming Soon!'));
            } else {
                var previousDate = '',
                    dayNumber = 0,
                    conferenceDate = '',
                    $pageNavigation = $('<div class="row"></div>'),
                    $agendaDay,
                    eventTime = createEventTimeHtml, // default function creating event time cell in table
                    eventInfo; // will be function creating event info cell in table

                // Create page beginning (navigational elements)
                createTopNavigator($PAGE);
                $PAGE.append($AGENDA_CONTAINER);
                $AGENDA_CONTAINER.append('<p><i class="fa fa-user-md fa-lg"></i> = APSA sponsored event</p>');
                $AGENDA_CONTAINER.append($pageNavigation);


                // Go through each event and add it to the agenda page, creating new days as needed
                for (var i = 0; i < events.length; i++) {
                    eventInfo = undefined;
                    // console.log('i', i);
                    // console.log('previous date', previousDate);
                    // console.log('event date', events[i].date);
                    if (! events[i].date) {
                        throw new Error("The " + formatPositionalNumber(i) + " event must have a date");
                    }

                    // create new html table for each day of the agenda
                    if (events[i].date !== previousDate) {
                        dayNumber++;
                        conferenceDate = new Date(events[i].date);

                        addAgendaDayNavigation(conferenceDate, dayNumber, $pageNavigation);
                        $agendaDay = createAgendaDay(conferenceDate, dayNumber, $AGENDA_CONTAINER);
                        previousDate = events[i].date;
                    }


                    console.log('agenda day', $agendaDay);
                    // determine how to format the event info
                    if (events[i].type.toLowerCase() === "normal") {
                        eventInfo = createNormalEventInfoHtml;
                    } else if (events[i].type.toLowerCase() === "session") {
                        eventInfo = createSessionEventInfo;
                    } else if (events[i].type.toLowerCase() === "keynote") {
                        eventInfo = createKeynoteEventInfo;
                    } else if (events[i].type.toLowerCase() === "panel") {
                        eventInfo = createPanelEventInfo;
                    }
                    if (eventInfo) {
                        createEventRow(events[i], $agendaDay, eventTime, eventInfo);
                    }

                }
            }

        })

        // Catch JSON format errors (error printout is not very informative unfortunately)
        .fail(function(error) {
            console.error('Formatting error in JSON Schedule:', error);
        });
    });
}());