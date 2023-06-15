// ==UserScript==
// @name         bestes-abi
// @namespace    https://derabirechner.de/
// @version      0.1
// @description  Import grades from beste.schule to derabirechner.de
// @author       Osi Bluber
// @icon         https://www.google.com/s2/favicons?sz=64&domain=derabirechner.de
// ==/UserScript==

// This userscript is not in direct contact to Schulverwalter (the creators of beste.schule) 
// nor to Leon Laurin Wehrhahn Handel und Vertrieb (the creators of derabirechner.de) thus 
// it's not official in any way.

(function() {
    'use strict';

    const SUBJECT_NAMES = {
        "DE": "Deutsch",
        "EN": "1. Fremdsprache",
        "FR": "2. Fremdsprache",
        "RU": "2. Fremdsprache",
        "LA": "2. Fremdsprache",
        "SPA": "3. Fremdsprache",
        "KU": "Kunst",
        "MU": "Musik",
        "GE": "Geschichte",
        "GRW": "G/R/W",
        "GEO": "Geographie",
        "MA": "Mathematik",
        "PH": "Physik",
        "CH": "Chemie",
        "BIO": "Biologie",
        "INF": "Informatik",
        "WBL": "Fächerverbindenden Grundkurs",
        "FVGK": "Fächerverbindenden Grundkurs",
        "SPO": "Sport",
        "REe": "Religion",
        "ETH": "Religion",
        "PHI": "Philosophie"
    }
    const CLICK = new MouseEvent("click", { bubbles: true, cancelable: false })
    let initiated = false
    let prev_href = window.location.href
    let averages
    let subjects
    
    
    // subject: {local_id, grades: []}
    // div: DOM-Element
    const editSubject = (div, subject) => {
        const select_subject = div.querySelector("select.select")
        select_subject.value = SUBJECT_NAMES[subject.local_id]
    
        const inputs_grade = div.querySelectorAll("input[type=number]")
    
        inputs_grade.forEach((input, i) => {
            if (subject.grades[i] && (input.value === "")) {
                input.value = subject.grades[i] 
            }
        });
    
    }
    
    const insertGrades = () => {
        // All subject rows
        let divs_subject = document.querySelectorAll("fieldset[name=test]>div.mb-2")
    
        const ignore_subjects = []
    
        // set 1st advanced course
        editSubject(divs_subject[0], {
            local_id: subjects.lk1, grades: [
                averages[0][subjects.lk1],
                averages[1][subjects.lk1],
                averages[2][subjects.lk1],
                averages[3][subjects.lk1]
            ]
        })
        ignore_subjects.push(subjects.lk1)
    
        // set 2nd advanced course
        editSubject(divs_subject[1], {
            local_id: subjects.lk2, grades: [
                averages[0][subjects.lk2],
                averages[1][subjects.lk2],
                averages[2][subjects.lk2],
                averages[3][subjects.lk2]
            ]
        })
        ignore_subjects.push(subjects.lk2)
    
        // set 3rd exam
        editSubject(divs_subject[2], {
            local_id: subjects.p3, grades: [
                averages[0][subjects.p3],
                averages[1][subjects.p3],
                averages[2][subjects.p3],
                averages[3][subjects.p3]
            ]
        })
        ignore_subjects.push(subjects.p3)
    
        // set 4th exam
        editSubject(divs_subject[3], {
            local_id: subjects.p4, grades: [
                averages[0][subjects.p4],
                averages[1][subjects.p4],
                averages[2][subjects.p4],
                averages[3][subjects.p4]
            ]
        })
        ignore_subjects.push(subjects.p4)
    
        // set 5th exam
        editSubject(divs_subject[4], {
            local_id: subjects.p5, grades: [
                averages[0][subjects.p5],
                averages[1][subjects.p5],
                averages[2][subjects.p5],
                averages[3][subjects.p5]
            ]
        })
        ignore_subjects.push(subjects.p5)
    
        const rest_subjects = []
    
        for (const local_id in averages[0]) {
            if (!ignore_subjects.includes(local_id))
                rest_subjects.push(local_id)
        }
    
        rest_subjects.forEach((local_id, i) => {
            editSubject(divs_subject[i + 5], {
                local_id, grades: [
                    averages[0][local_id],
                    averages[1][local_id],
                    averages[2][local_id],
                    averages[3][local_id],
                ]
            })
        })
    }
    
    
    const init = () => {
        if (initiated) {
            insertGrades();
            return
        }
    
        // Create an import button
        const row = document.querySelector("div.flex.justify-self-start.items-center")
        if (!row) {
            initiated = false
            return
        }
    
        const container = row.cloneNode(false)
        container.className += " my-2"
        row.after(container)
    
        const tooltip = document.querySelector("div.tooltip.tooltip-right")
        const ctooltip = tooltip.cloneNode(true)
        container.appendChild(ctooltip)
        ctooltip.setAttribute("data-tip", 'Damit kannst du deine Endnoten von beste.schule importieren (über den Durchschnittsberechner bester.durchschnitt). Mit "Importiertes löschen" kannst du die importierten Noten wieder aus dem Speicher löschen.')
    
        const cbutton = document.createElement("button")
        container.appendChild(cbutton)
        cbutton.className = "btn btn-sm btn-primary"
        cbutton.innerText = "Importieren von bester.durchschnitt"
        if (localStorage["bestes-abi"]) cbutton.setAttribute("disabled", "")
        cbutton.addEventListener("click", () => {
            window.location.href = "https://osipog.github.io/bester-durchschnitt-app?export=derabirechner"
        })
    
        const cdelete = document.createElement("button")
        container.appendChild(cdelete)
        cdelete.className = "btn btn-sm btn-outline btn-secondary mx-2"
        cdelete.innerText = "Importiertes löschen"
        if (!localStorage["bestes-abi"]) cdelete.setAttribute("disabled", "")
        cdelete.addEventListener("click", () => {
            delete localStorage["bestes-abi"]
            window.location.reload()
        })
    
        try {
            if (window.location.href.includes("?import=") || localStorage["bestes-abi"]) {
                // Get the object from the url params
                let json_string;
    
                if (window.location.href.includes("?import=")) {
                    [new_href, json_string] = decodeURI(window.location.href).split("?import=")
                    localStorage["bestes-abi"] = json_string
                    window.location.href = new_href
                }
                else if (localStorage["bestes-abi"]) {
                    json_string = localStorage["bestes-abi"]
                }
    
                [averages, subjects] = JSON.parse(json_string)
    
                // All subject rows
                let divs_subject = document.querySelectorAll("fieldset[name=test]>div.mb-2")
                initiating = true
    
                // if there are not enough subject rows add more with a virtual click on the button
                if (divs_subject.length < Object.keys(averages[0]).length) {
                    const button = document.querySelector("button.btn.btn-primary.btn-sm.justify-self-start.mt-5")
    
                    for (let i = 0; i < Object.keys(averages[0]).length - divs_subject.length; i++) {
                        button.dispatchEvent(CLICK)
                    }
                }
                initiated = true
                setTimeout(() => {
                    insertGrades()
                    document.addEventListener("click", init)
                }, 10)
            }
        }
        catch (e) {
            alert("Beim Importieren der Noten ist ein Fehler aufgetreten: " + e)
        }
    }
    
    setInterval(() => {
        if (window.location.href !== prev_href) {
            prev_href = window.location.href
            init()
        }
    }, 300)
    
    init()
})();