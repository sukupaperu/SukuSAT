function dimacsStringToClauses(dimacsString) {

    let dimacsLines = dimacsString.split("\n");

    for(let i = 0; i < dimacsLines.length; i++)
        if(dimacsLines[i].charAt(0) === "c")
            dimacsLines.splice(i--, 1);

    let param = dimacsLines.shift().split(" ");
    if(param[0] !== "p" || param[1] !== "cnf") {
        console.log("Error: Dimacs format not recognized (should begin with 'p cnf')");
        return null;
    }
    let nbLit = parseInt(param[2]);
    let nbCls = parseInt(param[3]);
    let solution = [];
    for(let i = 0; i < nbLit; i++) solution[i] = null;

    if(dimacsLines[dimacsLines.length - 1].charAt(0) === "")
        dimacsLines.length -= 1;

    if(nbCls !== dimacsLines.length) {
        console.log("Error: clauses number not concording with given parameters: ", nbCls, " given and", dimacsLines.length, " real ones");
        return null;
    }


    let clsArr = [];
    let clsSizeArr = [];
    for(let i = 0; i < dimacsLines.length; i++) {
        let dimacsSingleLine = dimacsLines[i].split(" ");
        clsArr[i] = [];
        clsSizeArr[i] = 0;

        for(let j = 0; j < dimacsSingleLine.length; j++) {

            if(dimacsSingleLine[j] !== "0") {
                let lit = parseInt(dimacsSingleLine[j]);
                let not = false;

                if(lit < 0) {
                    lit = Math.abs(lit);
                    not = true;
                }

                if(lit >= 1 && lit <= nbLit) {
                    clsArr[i].push([not, lit]);
                    clsSizeArr[i]++;
                } else {
                    console.log("Error: literal not concording with maximal announced value: has met litteral ", lit, " but maximum number is ", nbLit);
                    return null;
                }
            }

        }

    }

    return {
        nbCls: nbCls,
        nbLit: nbLit,
        clsArr: clsArr,
        clsSizeArr: clsSizeArr,
        contradiction: false
    };
}

const SATSOLVER_GLOBALS = {
    solution: []
};

function initSolution(clsArrObj) {
    solution = SATSOLVER_GLOBALS.solution;
    solution.length = 0;
    for(let i = 0; i < clsArrObj.nbLit; i++)
        solution[i] = null;
}

const getLitID = lit => lit[1];

const litIsNeg = lit => lit[0];

const complementaryLit = (lit1, lit2) => litIsNeg(lit1) !== litIsNeg(lit2) && getLitID(lit1) === getLitID(lit2);

const identicalLitStrict = (lit1, lit2) => litIsNeg(lit1) === litIsNeg(lit2) && getLitID(lit1) === getLitID(lit2);

const identicalLit = (lit1, lit2) => getLitID(lit1) === getLitID(lit2);

const litExists = lit => lit && lit.length > 0;

function deleteLit(clsArrObj, clsIndex, litIndex) {
    clsArrObj.clsArr[clsIndex][litIndex].length = 0;
    clsArrObj.clsSizeArr[clsIndex] -= 1;
    if(clsArrObj.clsSizeArr[clsIndex] === 0)
        deleteCls(clsArrObj, clsIndex);
    else if(clsArrObj.clsSizeArr[clsIndex] < 0)
        console.log("Error : cls de taille invalide (plus petite que 0)");
}

function deleteCls(clsArrObj, clsIndex) {
    if(clsArrObj.clsArr[clsIndex].length > 0) {
        clsArrObj.clsArr[clsIndex].length = 0;
        clsArrObj.nbCls -= 1;
        clsArrObj.clsSizeArr[clsIndex] = 0;
    }
}

const clsSize = (clsArrObj, clsIndex) => clsArrObj.clsSizeArr[clsIndex];

function clsAcontainsClsB(clsA, clsB) {

    if(clsA.length === 0 || clsB.length === 0) return false;

    let clsBintoClsA = true;

    for(let i = 0; i < clsB.length; i++) {
        let litB = clsB[i];

        if(litExists(litB)) {
            let currentLitBisIntoA = false;

            for(let j = 0; j < clsA.length; j++) {
                let litA = clsA[j];

                if(litExists(litA)) {
                    if(identicalLitStrict(litA, litB)) {
                        currentLitBisIntoA = true;
                        break;
                    }
                }

            }

            if(!currentLitBisIntoA) {
                clsBintoClsA = false;
                break;
            }
        }

    }

    return clsBintoClsA;
}


function addSolution(lit, value) {
    let litId = getLitID(lit);
    SATSOLVER_GLOBALS.solution[litId - 1] = value;
}

function assigningVar(clsArrObj, assignedLit, value) {

    if(clsArrObj.contradiction || !litExists(assignedLit)) return;

    let clsArr = clsArrObj.clsArr;
    let copyAssignedLit = Array.from(assignedLit);

    addSolution(copyAssignedLit, value === 1);

    for(let i = 0; i < clsArr.length; i++) {
        let cls = clsArr[i];

        for(let j = 0; j < cls.length; j++) {
            let lit = cls[j];

            if(litExists(lit)) {
                if(identicalLit(lit, copyAssignedLit)) {
                    if(value === 1) {
                        if(litIsNeg(lit)) {
                            deleteLit(clsArrObj, i, j);
                        } else {
                            deleteCls(clsArrObj, i);
                            break;
                        }
                    } else if(value === 0) {
                        if(litIsNeg(lit)) {
                            deleteCls(clsArrObj, i);
                            break;
                        } else {
                            deleteLit(clsArrObj, i, j);
                        }
                    }
                }
            }

        }

    }

}

function copyingClsArrObj(clsArrObj) {
    let newTabObj = [];
    for(let i = 0; i < clsArrObj.clsArr.length; i++) {
        newTabObj[i] = [];

        for(let j = 0; j < clsArrObj.clsArr[i].length; j++)
            newTabObj[i][j] = Array.from(clsArrObj.clsArr[i][j]);

    }

    return {
        nbCls: clsArrObj.nbCls,
        nbLit: clsArrObj.nbLit,
        clsArr: newTabObj,
        clsSizeArr: Array.from(clsArrObj.clsSizeArr),
        contradiction: clsArrObj.contradiction
    };
}

function cleaningClsArrObj(clsArrObj) {
    let clsArr = clsArrObj.clsArr;
    let clsSizeArr = clsArrObj.clsSizeArr;

    for(let i = 0; i < clsArr.length; i++) {
        let cls = clsArr[i];

        if(clsSize(clsArrObj, i) === 0) {
            clsArr.splice(i, 1);
            clsSizeArr.splice(i, 1);
            i--;
        }

    }
}

function nextLitAssigned(clsArrObj) {

    let nbOccurencelit = [];
    for(let i = 0; i <= clsArrObj.nbLit; i++)
        nbOccurencelit[i] = 0;

    let clsArr = clsArrObj.clsArr;
    for(let j = 0; j < clsArr.length; j++) {
        let cls = clsArr[j];

        for(let k = 0; k < cls.length; k++) {
            let lit = cls[k];

            if(litExists(lit))
                nbOccurencelit[getLitID(lit)]++;

        }

    }

    let nextLitValue;
    let nbOccurenceMaxProchainlit = 0;
    for(let i = 1; i < nbOccurencelit.length; i++) {

        nbOccurenceMaxProchainlit = Math.max(nbOccurenceMaxProchainlit, nbOccurencelit[i]);

        if(nbOccurencelit[i] === nbOccurenceMaxProchainlit)
            nextLitValue = i;

    }

    return [null, nextLitValue];
}


function reduction(clsArrObj) {
    let clsArr = clsArrObj.clsArr;

    for(let i = 0; i < clsArr.length; i++) {
        let cls1 = clsArr[i];

        for(let j = i + 1; j < clsArr.length; j++) {
            let cls2 = clsArr[j];

            if(clsSize(clsArrObj, i) > clsSize(clsArrObj, j)) {
                if(clsAcontainsClsB(cls1, cls2)) {
                    deleteCls(clsArrObj, i);
                }
            } else if(clsSize(clsArrObj, i) < clsSize(clsArrObj, j)) {
                if(clsAcontainsClsB(cls2, cls1)) {
                    deleteCls(clsArrObj, j);
                }
            }
        }
    }
}

function elimination(clsArrObj) {
    let clsArr = clsArrObj.clsArr;
    let nbLit = clsArrObj.nbLit;
    let clsArrObjHasBeenModified = false;

    for(let i = 1; i <= nbLit; i++) {

        let litWanted = [null, i];
        let firstLitFound = null;
        let litIsInvariant = false;

        loop1:
            for(let j = 0; j < clsArr.length; j++) {
                let cls = clsArr[j];

                for(let k = 0; k < cls.length; k++) {
                    let lit = cls[k];


                    if(litExists(lit)) {
                        if(!firstLitFound) {
                            if(identicalLit(lit, litWanted)) {
                                firstLitFound = lit;
                                litIsInvariant = true;
                            }
                        } else {
                            if(complementaryLit(lit, firstLitFound)) {
                                litIsInvariant = false;
                                break loop1;
                            }
                        }
                    }

                }

            }

        if(litIsInvariant) {
            clsArrObjHasBeenModified = true;

            assigningVar(clsArrObj, firstLitFound, litIsNeg(firstLitFound) ? 0 : 1);
        }

    }

    return clsArrObjHasBeenModified;
}

function unitResolution(clsArrObj) {
    let clsArrObjHasBeenModified = false;
    let clsArr = clsArrObj.clsArr;
    let isolatedLit = [];

    do {
        isolatedLit.length = 0;

        loop1:
            for(let i = 0; i < clsArr.length; i++) {
                let cls = clsArr[i];

                if(clsSize(clsArrObj, i) === 1) {
                    for(let j = 0; j < cls.length; j++) {
                        let lit = cls[j];

                        if(litExists(lit)) {
                            isolatedLit = Array.from(lit);
                            break loop1;
                        }

                    }
                }

            }

        if(litExists(isolatedLit)) {

            for(let i = 0; i < clsArr.length; i++) {
                let cls = clsArr[i];

                if(clsSize(clsArrObj, i) === 1) {
                    for(let j = 0; j < cls.length; j++) {
                        let isolatedLit2 = cls[j];

                        if(litExists(isolatedLit2)) {
                            if(complementaryLit(isolatedLit2, isolatedLit)) {
                                clsArrObj.contradiction = true;
                                return true;
                            }
                        }
                    }
                }

            }

            clsArrObjHasBeenModified = true;

            assigningVar(clsArrObj, isolatedLit, litIsNeg(isolatedLit) ? 0 : 1);
        }

    } while (litExists(isolatedLit));

    return clsArrObjHasBeenModified;
}

function DPLL(clsArrObj) {

    let clsArrObjHasBeenModified;
    do {
        if(clsArrObj.contradiction)
            return false;

        if(clsArrObj.nbCls === 0)
            return true;

        reduction(clsArrObj);

        clsArrObjHasBeenModified = elimination(clsArrObj);

        if(!clsArrObjHasBeenModified) clsArrObjHasBeenModified = unitResolution(clsArrObj);

    } while (clsArrObjHasBeenModified);

    cleaningClsArrObj(clsArrObj);

    let litAssigne = nextLitAssigned(clsArrObj);

    let clsArrObjA = copyingClsArrObj(clsArrObj);
    assigningVar(clsArrObjA, litAssigne, 0);
    if(DPLL(clsArrObjA)) return true;

    let clsArrObjB = copyingClsArrObj(clsArrObj);
    assigningVar(clsArrObjB, litAssigne, 1);
    return DPLL(clsArrObjB);
}

function resolutionDPLL(clsArrObj) {
    initSolution(clsArrObj);

    let clsArr = clsArrObj.clsArr;
    for(let i = 0; i < clsArr.length; i++) {
        let cls = clsArr[i];
        let validCls = false;

        loop1:
            for(let j = 0; j < cls.length; j++) {
                let lit1 = cls[j];

                if(litExists(lit1)) {
                    for(let k = j + 1; k < cls.length; k++) {
                        let lit2 = cls[k];

                        if(litExists(lit2)) {
                            if(complementaryLit(lit1, lit2)) {
                                validCls = true;
                                break loop1;
                            }
                        }

                    }
                }

            }

        if(validCls) deleteCls(clsArrObj, i);

    }

    return clsArrObj.nbCls === 0 ? true : DPLL(clsArrObj);
}