/**
  NiceScale class - javascript interpretation
  algorithm psuedo code from Graphics gems by Andrew S. Glassner
  http://books.google.at/books?id=fvA7zLEFWZgC&printsec=frontcover&redir_esc=y#v=onepage&q&f=false
  algorithm Java code by Steffen L. Norgren
  http://trollop.org/2011/03/15/algorithm-for-optimal-scaling-on-a-chart-axis/
  
  TODO: Fix the floating point problem!
  
**/

NiceScale = function ( min, max) {
 
  this.minPoint = min;
  this.maxPoint = max;
  this.maxTicks = 10;
  this.tickSpacing = 0;
  this.range = 0;
  this.niceMin = 0;
  this.niceMax = 0;
  this.tickNum = 0
 
 
    /**
     * Calculate and update values for tick spacing and nice
     * minimum and maximum data points on the axis.
     */
    this.calculate = function() {
        this.range = niceNum(this.maxPoint - this.minPoint, false);
        this.tickSpacing = niceNum(this.range / (this.maxTicks - 1), true);
        this.niceMin =
            Math.floor(this.minPoint / this.tickSpacing) * this.tickSpacing;
        this.niceMax =
            Math.ceil(this.maxPoint / this.tickSpacing) * this.tickSpacing;
        this.tickNum = this.range / this.tickSpacing;
    }
 
    /**
     * Returns a "nice" number approximately equal to range Rounds
     * the number if round = true Takes the ceiling if round = false.
     *
     * @param range the data range
     * @param round whether to round the result
     * @return a "nice" number to be used for the data range
     */
    var niceNum = function ( range, round ) {
        var exponent; /** exponent of range */
        var fraction; /** fractional part of range */
        var niceFraction; /** nice, rounded fraction */
 
        exponent = Math.floor(log10(range));
        fraction = range / Math.pow(10, exponent);
 
        if (round) {
                if (fraction < 1.5)
                    niceFraction = 1;
                else if (fraction < 3)
                    niceFraction = 2;
                else if (fraction < 7)
                    niceFraction = 5;
                else
                    niceFraction = 10;
        } else {
                if (fraction <= 1)
                    niceFraction = 1;
                else if (fraction <= 2)
                    niceFraction = 2;
                else if (fraction <= 5)
                    niceFraction = 5;
                else
                    niceFraction = 10;
        }
 
        return niceFraction * Math.pow(10, exponent);
    }
    
    var log10 = function(val) {
      return Math.log(val) / Math.LN10;
    }
 
    /**
     * Sets the minimum and maximum data points for the axis.
     *
     * @param minPoint the minimum data point on the axis
     * @param maxPoint the maximum data point on the axis
     */
    this.setMinMaxPoints = function ( minPoint, maxPoint) {
        this.minPoint = minPoint;
        this.maxPoint = maxPoint;
        this.calculate();
    }
 
    /**
     * Sets maximum number of tick marks we're comfortable with
     *
     * @param maxTicks the maximum number of tick marks for the axis
     */
    this.setMaxTicks = function ( maxTicks ) {
      this.maxTicks = maxTicks;
      this.calculate();
    }
 
 
}