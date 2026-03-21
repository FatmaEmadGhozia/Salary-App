function monthlyHours(dayHours, weekDays, weeknums) {
    return dayHours * weekDays * weeknums;     //  8 * 5 * 4 ;

}

function hourValue(basicalary, monthlyHour) {

    return basicalary / monthlyHour;

}


function extraHoursValue(extraHours, hourVal) {
    return extraHours * hourVal;
}

function grossSalary(basicSalary, bonus, penalty, extraHRValue) {

    return basicSalary + bonus - penalty + extraHRValue;
}




function TaxValue(gross, tax) {
    return gross * tax;
}

console.log(TaxValue(4500, 0.1));


function Netsalary (gross ,taxval ) {
 return gross - taxval
}





