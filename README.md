# SukuSAT
An open source JavaScript [CNF-SAT solver](https://en.wikipedia.org/wiki/Boolean_satisfiability_problem#Algorithms_for_solving_SAT) (based on a simple version of [DPLL algorithm](https://en.wikipedia.org/wiki/DPLL_algorithm)).
## About this library
This project was created as part of a student project. Its point is clearly not to performing the fastest SAT solving, but it should works in most use cases.
## Getting started
### Loading SukuSAT
Download one of two files (`sat-solver-min.js` is just smaller than `sat-solver.js`), then load it up with the following line:

    <script src="suku-sat-solver-min.js"></script>
    
or

    <script src="suku-sat-solver.js"></script>
    
### Using SukuSAT

Setting up a trivial DIMACS string

    let dimacsString = 
      "p cnf 2 2\n" +
      "1 0\n" +
      "1 2 0"
    ;

Getting an object the SAT Solver will use in order to find (or not) a solution to the given clauses set

    let satClausesObj = dimacsStringToClauses(dimacsString);

The function returns a boolean according to the satisfiability of the clauses set ;
Solution will be contained into an array of the global variable SATSOLVER_GLOBALS (here results are displayed into the web browser JavaScript console)

    if(satClausesObj) {

      let result = resolutionDPLL(satClausesObj);
      
      if(result) {

        console.table(SATSOLVER_GLOBALS.solution);

      } else {
        console.log("The set of clauses is unsatisfiable");
      }
      
    } else {
      console.log("DIMACS string not valid");
    }
