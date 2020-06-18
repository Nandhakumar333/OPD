$("#symptoms").change(function(){
    var select=$('#symptoms').val();
    var parameters = { search: $(this).val() };
    $.get( '/knowdoctor',parameters, function(data) {
       return data
      });
      var list=[
        {name:"Dr.AK",symtoms:"lungs"},
        {name:"Dr.NK",symtoms:"eye"},
        {name:"Dr.PK",symtoms:"heart"},
        {name:"Dr.MK",symtoms:"sugar"},
        {name:"Dr.CK",symtoms:"ear"}
    ]
    const n=list.filter(function(data){
        if(data.symtoms == select){
            return data.name;
        }
        else{
            return null;
        }
    });
    console.log(n);
    n.forEach(function(list){
        var name=$('#drname').val(list.name);
    })
    
   
      
    
})