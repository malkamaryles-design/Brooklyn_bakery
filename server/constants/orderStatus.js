const STATUS_LABELS = { 
  pending:   'ממתין לאישור',   
  preparing: 'בהכנה',          
  shipped:   'יצא למשלוח',    
  delivered: 'נמסר',           
};
const VALID_STATUSES = Object.keys(STATUS_LABELS); 
module.exports = { STATUS_LABELS, VALID_STATUSES }; 