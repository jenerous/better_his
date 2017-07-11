// ==UserScript==
// @name         KIS Mark extractor
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extract your marks in KIS university system
// @author       Jens Hertfelder
// @match        https://vw-online.hdm-stuttgart.de/qisserver/rds?state=htmlbesch&moduleParameter=Student&menuid=notenspiegel*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function closeResultBox(){
        $('#resultBox').remove();
    }

    function calcAverage(){
        if (document.getElementById('resultBox')){
            closeResultBox();
        }
        var marks  = [];
        var ects   = [];
        var stat   = [];
        var basicMainSplit = 0;

        $('tr').each(function(i,e){
            if ($(e).children('th').text() == 'Hauptstudium'){
                basicMainSplit = i;
            }
            marks.push(($(e).children('td.tabelle1')[5]));
            ects.push(($(e).children('td.tabelle1')[7]));
            stat.push(($(e).children('td.tabelle1')[6]));
        });

        var marksFloatB       = [];
        var marksFloatM       = [];
        var unis              = [];
        var sumMarksB         = 0;
        var sumMarksM         = 0;
        var sumWeightedMarksB = 0;
        var sumWeightedMarksM = 0;
        var sumECTSB          = 0;
        var sumECTSM          = 0;
        var sumECTSnotMarked  = 0;

        for(var i=0; i < marks.length; i++){

            var candidateMark = parseFloat($(marks[i]).text().trim().replace(',','.'));
            var candidateECTS = parseInt($(ects[i]).text().trim());
            var currentStatus = $(stat[i]).text().trim();
            if (!isNaN(candidateECTS) && !isNaN(candidateMark) && currentStatus == 'bestanden'){
                // marked ECTS
                if (i < basicMainSplit) {
                    sumECTSB += candidateECTS;
                    marksFloatB.push(candidateMark);
                    sumWeightedMarksB += (candidateMark*candidateECTS);
                    sumMarksB += candidateMark;

                } else {
                    sumECTSM += candidateECTS;
                    marksFloatM.push(candidateMark);
                    sumWeightedMarksM += (candidateMark*candidateECTS);
                    sumMarksM += candidateMark;
                }

                if (unis.indexOf(candidateMark) == -1){
                    unis.push(candidateMark);
                }

            } else if(!isNaN(candidateECTS) && currentStatus == 'bestanden') {
                // not marked ECTS
                sumECTSnotMarked += candidateECTS;
            }
        }

        var bachelorThesis = parseFloat(prompt('Welche Note erwartest Du in deiner Bachelornote?').replace(',','.'));

        var results = '';

        results += $('.content table td:last-child .liste1 > .nobr').text() + '<br />';
        results += '<hr />';
        results += '<br />';
        results += 'Schnitt Grundstudium            : ' + (sumMarksB/marksFloatB.length).toFixed(2) + '<br />';
        results += 'Schnitt Grundstudium (gewichtet): ' + (sumWeightedMarksB/sumECTSB).toFixed(2) + '<br />';
        results += '<br />';
        results += '<hr />';
        results += '<br />';
        results += 'Schnitt Hauptstudium            : ' + (sumMarksM/marksFloatM.length).toFixed(2) + '<br />';
        results += 'Schnitt Hauptstudium (gewichtet): ' + (sumWeightedMarksM/sumECTSM).toFixed(2) + '<br />';
        results += '<br />';
        results += '<hr />';
        results += '<hr />';
        results += '<br />';
        results += '   Grundstudium   (15%)' + '<br />';
        results += ' + Hauptstudium   (70%)' + '<br />';
        results += ' + Bachelorarbeit (15%)         : ' + (0.15 * sumWeightedMarksB/sumECTSB + 0.7 * sumWeightedMarksM/sumECTSM + 0.15 * bachelorThesis).toFixed(2);
        results += '<br />&nbsp;';
        results += '<hr />';
        results += '<hr />';
        results += '<br />';

        for(var u in unis.sort()){
            var counter = 0;
            for(var t in marksFloatB){
                if(marksFloatB[t] == unis[u]){
                    counter++;
                }
            }
            for(var t in marksFloatM){
                if(marksFloatM[t] == unis[u]){
                    counter++;
                }
            }
            var out = '';
            for(var i=0; i < 5-unis[u].toString().length; i++){
                out += ' ';
            }
            for(var i=0; i < counter; i++){
                out += '|';
            }
            results += unis[u] + ':' + out + '<br />';
        }

        results += '<br />';
        results += '<hr />';
        results += '<br />';
        results += 'ECTS (benotet)     : ' + (sumECTSB + sumECTSM) + '<br />';
        results += 'ECTS (unbenotet)   : ' + sumECTSnotMarked + '<br />';
        results += 'ECTS Bachelorarbeit: 12' + '<br />';
        results += '<br />';
        results += '<hr />';
        results += '<br />';
        results += 'ECTS Summe         : ' + (sumECTSB + sumECTSM + sumECTSnotMarked + 12) + ' / 210' + '<br />';
        results += '<br />';
        results += '<hr />';
        results += '<br />';
        results += '<span id="closeResultBoxButton" style="color: white; background: #b30d00; padding: 10px; cursor:pointer;">close</span>';

        var resultBoxStyle = "box-shadow: 0px 0px 30px 2px #333; position:fixed; top: 10%; left: calc(50% - 250px); width: 500px; background: white; padding: 10px;";
        $('body').append('<div id="resultBox" style="' + resultBoxStyle + '"><pre>'+results+'</pre></div>');
        $('#closeResultBoxButton').click(closeResultBox);
    }
var calcAverageButtonStyle = "position:absolute; top: 0px; right: 0px; color: white; background: #b30d00; padding: 10px; cursor:pointer;";
$('body').append('<div id="calcAverageButton" style="' + calcAverageButtonStyle + '">Noten berechnen</div>');
$('#calcAverageButton').click(calcAverage);

})();
