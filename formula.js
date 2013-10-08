var formula = null;

exports.setDB = function(db)
{
  formula = db.collection('chemicals');
}

exports.getAllFormulaData = function(callback)
{
	formula.find().toArray(function(err,all_formulas) {
		var formula_data = [];
		for(i = 0; i < all_formulas.length; i++)
		{
			formula_data.push({"Registration Number":all_formulas[i].regnum.substring(0,20),
                                "PC Percentage":all_formulas[i].pcpct,
                                "Product Name":all_formulas[i].prodname,
                                "PC Code":all_formulas[i].pccode})
		}
		callback(null,formula_data);
	});
}

exports.getAllProductNames = function(callback)
{
  getAllFormulaData( function(err,all_formulas){
    var prodname_data = [];
    for(i = 0; i < all_formulas.length; i++)
    {
      prodname_data.push(all_formulas[i].prodname.substring(0,20));
    }
    callback(null,prodname_data);
  })
}

exports.getFormulaDataFromPCCode = function(pc_code,callback)
{ 
  formula.find({pccode:pc_code}).toArray(function(err,all_formulas) {
    var formula_data = [];
    for(i = 0; i < all_formulas.length; i++)
    {
      formula_data.push({"Registration Number":all_formulas[i].regnum.substring(0,20),
                                "PC Percentage":all_formulas[i].pcpct,
                                "Product Name":all_formulas[i].prodname,
                                "PC Code":all_formulas[i].pccode})
    }
    callback(null,formula_data);
  });
}

exports.getFormulaData = function(registration_num,callback)
{ 
  formula.findOne({regnum:registration_num},function(err,chemical) {
    callback(null,chemical);
  });
}