// ==UserScript==
// @name         better HIS
// @namespace    https://github.com/jhertfe/better_his
// @version      1.0
// @description  Additional information on HIS university system. E.g. statistics on your marks
// @author       Jens Hertfelder
// @match        https://qis-studenten.htw-aalen.de/qisserverstud/rds?state=notenspiegelStudent*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var resultData = {};
    resultData['init'] = false;

    function printResults(){
        if (document.getElementById('resultBox')){
            $('#resultBox').remove();
        }
        var bachelorThesisMarkStyle = 'padding: 0px; margin-left:20px';
        var results = '';

        results += $('.content table td:last-child .liste1 > .nobr').text().trim() + ' - ' + resultData['currentTerm'] + '<br />';
        results += '<hr />';
        results += '<br />';
        results += 'Schnitt Grundstudium            : ' + (resultData['sumMarksB']/resultData['marksFloatB'].length).toFixed(2) + '<br />';
        results += 'Schnitt Grundstudium (gewichtet): ' + (resultData['sumWeightedMarksB']/resultData['sumECTSB']).toFixed(2) + '<br />';
        results += '<br />';
        results += '<hr />';
        results += '<br />';
        results += 'Schnitt Hauptstudium            : ' + (resultData['sumMarksM']/resultData['marksFloatM'].length).toFixed(2) + '<br />';
        results += 'Schnitt Hauptstudium (gewichtet): ' + (resultData['sumWeightedMarksM']/resultData['sumECTSM']).toFixed(2) + '<br />';
        results += '<br />';
        results += '<hr />';
        results += '<br />';
        results += 'Bachelor Thesis                 : <span id="selectedBachelorThesisMark">' + resultData['bachelorThesis'] + '</span>';
        results += '<input id="bachelorThesisMark" style="' + bachelorThesisMarkStyle + '" type="range" name="bachelorThesisMark" min="1.0" max="4.0"  step="0.1" value="' + resultData['bachelorThesis'] + '">';
        results += '<br /> <br />';
        results += '<hr />';
        results += '<hr />';
        results += '<br />';
        results += '   Grundstudium   (15%)' + '<br />';
        results += ' + Hauptstudium   (70%)' + '<br />';
        results += ' + Bachelorarbeit (15%)         : ' + (0.15 * resultData['sumWeightedMarksB']/resultData['sumECTSB'] + 0.7 * resultData['sumWeightedMarksM']/resultData['sumECTSM'] + 0.15 * resultData['bachelorThesis']).toFixed(2);
        results += '<br />&nbsp;';
        results += '<hr />';
        results += '<hr />';
        results += '<br />';
        results += 'Notenverteilung:'
        results += '<br />';

        for(var u in resultData['unis'].sort()){
            var counter = 0;
            for(var t in resultData['marksFloatB']){
                if(resultData['marksFloatB'][t] == resultData['unis'][u]){
                    counter++;
                }
            }
            for(var t in resultData['marksFloatM']){
                if(resultData['marksFloatM'][t] == resultData['unis'][u]){
                    counter++;
                }
            }
            var out = '';
            for(var i=0; i < 5-resultData['unis'][u].toString().length; i++){
                out += ' ';
            }
            for(var i=0; i < counter; i++){
                out += '|';
            }
            results += resultData['unis'][u] + ':' + out + '<br />';
        }

        results += '<br />';
        results += '<hr />';
        results += '<br />';
        results += 'ECTS (benotet)     : ' + (resultData['sumECTSB'] + resultData['sumECTSM']) + '<br />';
        results += 'ECTS (unbenotet)   : ' + resultData['sumECTSnotMarked'] + '<br />';
        results += 'ECTS Bachelorarbeit: 12' + '<br />';
        results += '<br />';
        results += '<hr />';
        results += '<br />';
        results += 'ECTS Summe         : ' + (resultData['sumECTSB'] + resultData['sumECTSM'] + resultData['sumECTSnotMarked'] + 12) + ' / 210' + '<br />';
        results += '<br />';
        results += '<hr />';
        results += '<br />Angaben ohne Gewähr!';

        var resultBoxStyle = "padding: 10px;";
        $('body div.content table:last').after('<div id="resultBox" style="' + resultBoxStyle + '"><pre>'+results+'</pre></div>');
        $('#bachelorThesisMark').change(function(){
            resultData['bachelorThesis'] = $('#bachelorThesisMark').val();
            resultData['bachelorThesis'] = (resultData['bachelorThesis'] * 1.0).toFixed(2);
            printResults();
        });

        $('#bachelorThesisMark').on('input', function(){
            $('#selectedBachelorThesisMark').text((this.value * 1.0).toFixed(2));
        });
    }

    function calcAverage(){
        var marks  = [];
        var ects   = [];
        var stat   = [];
        var terms  = [];
        var basicMainSplit = 0;

        //  collect data
        $('table:last tr').each(function(i,e){
            if ($(e).children('th').text() == 'Hauptstudium'){
                basicMainSplit = i;
            }
            terms.push(($(e).children('td')[2]));
            marks.push(($(e).children('td')[3]));
            stat.push(($(e).children('td')[4]));
            ects.push(($(e).children('td')[5]));
            console.log(i);
        });

        // init for statistics
        resultData['marksFloatB']       = [];
        resultData['marksFloatM']       = [];
        resultData['unis']              = [];
        resultData['sumMarksB']         = 0;
        resultData['sumMarksM']         = 0;
        resultData['sumWeightedMarksB'] = 0;
        resultData['sumWeightedMarksM'] = 0;
        resultData['sumECTSB']          = 0;
        resultData['sumECTSM']          = 0;
        resultData['sumECTSnotMarked']  = 0;

        resultData['currentTermNb'] = 0;
        resultData['currentTerm'] = 'not defined yet';

        for(var i=0; i < terms.length; i++){
            if (terms[i] != undefined){
                var num = parseInt($(terms[i]).text().substr($(terms[i]).text().length - 3));
                if (num > resultData['currentTermNb'] || (num == resultData['currentTermNb'] && $(terms[i]).text().length <= resultData['currentTerm'].length)){
                    resultData['currentTermNb'] = num;
                    resultData['currentTerm'] = $(terms[i]).text().trim();
                }
            }
        }

        $('tr').each(function(i,e){
            if($(e).children('td.tabelle1')[4] != undefined){
                if($($(e).children('td.tabelle1')[4]).text().trim() == resultData['currentTerm']){
                    $(e).children('td.tabelle1').css({"background": "#70e885"});
                    var current_status = $($(e).children('td.tabelle1')[6]).text().trim();
                    if(current_status == 'angemeldet'){
                        $($(e).children('td.tabelle1')[6]).css({"background": "#70e2e8"});
                    } else if(current_status == 'bestanden'){
                        $($(e).children('td.tabelle1')[6]).css({"background": "#009a1b", "color": "white"});
                    } else {
                        $($(e).children('td.tabelle1')[6]).css({"background": "#c16161", "color": "white"});
                    }
                }

            }
        });

        for(var i=0; i < marks.length; i++){

            var candidateMark = parseFloat($(marks[i]).text().trim().replace(',','.'));
            var candidateECTS = parseInt($(ects[i]).text().trim());
            var currentStatus = $(stat[i]).text().trim();
            if (!isNaN(candidateECTS) && !isNaN(candidateMark) && currentStatus == 'bestanden'){
                // marked ECTS
                if (i < basicMainSplit) {
                    resultData['sumECTSB'] += candidateECTS;
                    resultData['marksFloatB'].push(candidateMark);
                    resultData['sumWeightedMarksB'] += (candidateMark*candidateECTS);
                    resultData['sumMarksB'] += candidateMark;

                } else {
                    resultData['sumECTSM'] += candidateECTS;
                    resultData['marksFloatM'].push(candidateMark);
                    resultData['sumWeightedMarksM'] += (candidateMark*candidateECTS);
                    resultData['sumMarksM'] += candidateMark;
                }

                if (resultData['unis'].indexOf(candidateMark) == -1){
                    resultData['unis'].push(candidateMark);
                }

            } else if(!isNaN(candidateECTS) && currentStatus == 'bestanden') {
                // not marked ECTS
                resultData['sumECTSnotMarked'] += candidateECTS;
            }
            else if(!isNaN(candidateECTS) && currentStatus == 'angemeldet') {
               // not marked ECTS
               resultData['sumECTSnotMarked'] += candidateECTS;
           }
        }

        if (resultData['bachelorThesis'] == undefined){
            resultData['bachelorThesis'] = (resultData['sumWeightedMarksM']/resultData['sumECTSM']).toFixed(2);
        }
        printResults();
    }
var calcAverageButtonStyle = "position:absolute; top: 0px; right: 0px; color: white; background: #b30d00; padding: 10px; cursor:pointer;";
calcAverage();

})();
