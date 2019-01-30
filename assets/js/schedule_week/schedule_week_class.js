class Caset_Class 
{
    constructor (p_id_container) 
    {

        this.g_id_container = p_id_container;
        this.g_config_list  = 
        {
            cfg_data_inicial               :moment().startOf('isoWeek'),
            cfg_data_format                :'dd, DD MMMM',
            cfg_num_pixels_cell_height_px  :32,
            cfg_num_minuts_interval        :30,
            cfg_event_accions              :null,
            cfg_num_cells_height_default   :2,
            cfg_bool_allow_aproximacions   : true,
            cfg_event_click_element        : null,
            cfg_number_of_days             :7,
        };

        this.g_classe_avui      = "cls_cm_div_header_columna_dia_avui";
        this.g_classe_div_cell  = "cls_horari";


        this.g_json_data_schedules = [];

        this.g_obj_div_spinner      =  null;
        this.g_obj_span_count       =  null;
       

    }

    _asignar_configuracio_per_defecte_o_indicats(p_list_keys_values)
    {
        if (p_list_keys_values)
        {
            var l_array_keys = Object.keys(this.g_config_list);
            var arrayLength = l_array_keys.length;
            for (var i = 0; i < arrayLength; i++) 
            {
                var l_key_name = l_array_keys[i];
                if (l_key_name in p_list_keys_values) this.g_config_list[l_key_name]  = p_list_keys_values[l_key_name];
            }
        }
    }

      _carregar_html_base(p_function_callback) 
      { 
          var me = document.querySelector('script[data-name="schedule-week"]');
  
          var l_path = me.src.substring(0, me.src.lastIndexOf('/')) + "/";

          this.loadHTML(this.g_id_container, l_path + "/html/schedule_week.html", p_function_callback);
      }

      loadHTML(p_id, url, p_function_callback) 
      {
        var xmlhttp;
        if (window.XMLHttpRequest) 
        {
            xmlhttp = new XMLHttpRequest();
        } 
        else 
        {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    
        xmlhttp.onreadystatechange = function() 
        {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) 
            {
               if(xmlhttp.status == 200)
               {
                   //XXXX_ will be replaced by id of container to allow multiple schedules in the same page
                    var l_html = xmlhttp.responseText;
                    var l_dd = l_html.replace(/XXXX/g, p_id)  

                    document.getElementById(p_id).innerHTML =l_dd;

                    p_function_callback(p_id);
               }
               else {
                   alert('Error');
               }
            }
        }
    
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }
    
    _construir_columnes_necesaries()
    {
        
        var l_obj_div_columna = document.querySelector("#"+this.g_id_container + " " + "#id_cm_div_columna");
        var l_iterador = 1;
        while (l_iterador < this.g_config_list['cfg_number_of_days'])
        {
            l_obj_div_columna.parentElement.appendChild(l_obj_div_columna.cloneNode(true));
            l_iterador++;
        }
    }


    _prepare_objects() 
    {
        this._construir_columnes_necesaries();
        
        this.g_llista_objectes_capcalera_dies     = document.querySelectorAll("#"+this.g_id_container + " .cls_cm_div_header_columna_dia");   
        this.g_llista_objectes_columna_hores      = document.querySelectorAll("#"+this.g_id_container + " .cls_cm_div_header_columna_hores");
        
        this.g_obj_div_spinner                    = document.getElementById(this.g_id_container + "_" + "id_cm_calendari_spinner");

        this. g_obj_span_count =   document.getElementById(this.g_id_container + "_" + "id_cm_calendari_span_count");
        
        this._contruir_calendari(this.g_config_list['cfg_data_inicial'], false);

        this._preparar_events();
    }

    _executar_accio(p_codi_accio)
    {
        if (p_codi_accio)
        {
            if (p_codi_accio == "NEXT_WEEK")
            {
                this.g_config_list['cfg_data_inicial'].add(this.g_config_list['cfg_number_of_days'], 'days');
                this._contruir_calendari(this.g_config_list['cfg_data_inicial'], false); 
            }

            if (p_codi_accio == "PREVIOUS_WEEK")
            {
                this.g_config_list['cfg_data_inicial'].subtract(this.g_config_list['cfg_number_of_days'], 'days');
                this._contruir_calendari(this.g_config_list['cfg_data_inicial'], false);
            }

            if (p_codi_accio == "TODAY")
            {
                this.g_config_list['cfg_data_inicial'] =  moment();
                this._contruir_calendari(this.g_config_list['cfg_data_inicial'], false);
            }

            if (p_codi_accio == "THIS_WEEK")
            {
                this.g_config_list['cfg_data_inicial'] = moment().startOf('isoWeek'); // el dilluns d'aquesta setmana
                this._contruir_calendari(this.g_config_list['cfg_data_inicial'], false);
            }

            if (p_codi_accio == "INPUT-DATE-CHANGED")
            {
               var l_valor = document.getElementById(this.g_id_container + "_" + "id_cm_calendari_input_date").value;
                if (!l_valor)
                {
                    l_valor =  moment().format('YYYY-MM-DD');;
                }

                this.g_config_list['cfg_data_inicial'] =  moment(l_valor);
                this._contruir_calendari(this.g_config_list['cfg_data_inicial'], false);
            }

            if (p_codi_accio == "CLEAR_DATA")
            {
                this._netejar_horaris();
            }

            if (p_codi_accio == "FILL_DATA")
            {
                //this._netejar_horaris();

                this._mostrar_elements_json();
            }

            if (this.g_config_list['cfg_event_accions'])
            {
                if (typeof this.g_config_list['cfg_event_accions'] === "function") 
                {
                   this.g_config_list['cfg_event_accions'](this.g_id_container, p_codi_accio,  this.g_config_list['cfg_data_inicial']); 
                }
            }
        }
    }

    
    _preparar_events()
    {
        var self = this;

        document.getElementById(this.g_id_container + "_" + "id_cm_calendari_bt_accio_seguent").addEventListener("click", function()
        {
            self._executar_accio("NEXT_WEEK");
        });

        
        document.getElementById(this.g_id_container + "_" + "id_cm_calendari_bt_accio_anterior").addEventListener("click", function()
        {
            self._executar_accio("PREVIOUS_WEEK");
        });

 
        document.getElementById(this.g_id_container + "_" + "id_cm_calendari_bt_accio_avui").addEventListener("click", function()
        {
            self._executar_accio("TODAY");
        });

        document.getElementById(this.g_id_container + "_" + "id_cm_calendari_bt_accio_semana").addEventListener("click", function()
        {
            self._executar_accio("THIS_WEEK");
        });

     
        document.getElementById(this.g_id_container + "_" + "id_cm_calendari_input_date").addEventListener("change", function()
        {
            
            self._executar_accio("INPUT-DATE-CHANGED");
        });
        
        document.getElementById(this.g_id_container + "_" + "id_cm_calendari_bt_accio_netejar").addEventListener("click", function()
        {
            self._executar_accio("CLEAR_DATA");
        });

        document.getElementById(this.g_id_container + "_" + "id_cm_calendari_bt_accio_emplenar").addEventListener("click", function()
        {
            self._executar_accio("FILL_DATA");
        });
    }

    


    _contruir_calendari (p_obj_date, p_bool_mostrar_elements = false) 
    {
    
       this.g_obj_div_spinner.style.visibility  = "visible";
       this.g_obj_span_count.innerHTML          = "0 elements";
       this.g_config_list['cfg_data_inicial']   = p_obj_date;

       this._canviar_valor_input_data();

       if (this.g_llista_objectes_capcalera_dies)
       {
            var l_iterador = 0;
            var l_obj_data_aux =  moment(this.g_config_list['cfg_data_inicial'].format('YYYY-MM-DD'));
            var l_avui_sql = moment().format('YYYY-MM-DD');
            
           while (l_iterador < this.g_llista_objectes_capcalera_dies.length)
           {
               
                this.g_llista_objectes_capcalera_dies[l_iterador].innerHTML = this._obtenir_html_div_header_dia(l_obj_data_aux);
              
                var l_cadena_classes = this.g_llista_objectes_capcalera_dies[l_iterador].className.replace(this.g_classe_avui, '');

                if  (moment(l_obj_data_aux).format('YYYY-MM-DD') == l_avui_sql)
                {
                    l_cadena_classes = l_cadena_classes + " " + this.g_classe_avui;
                }

                this.g_llista_objectes_capcalera_dies[l_iterador].className = l_cadena_classes;

                this._crear_celdes_de_la_columna(l_iterador, l_obj_data_aux);

                 l_iterador++;
                 l_obj_data_aux = l_obj_data_aux.add(1, 'days');
           }
       }
      
       if (p_bool_mostrar_elements) 
       {
           this._mostrar_elements_json();
       }

       this.g_obj_div_spinner.style.visibility = "hidden";
    }



    _crear_celdes_de_la_columna(p_iterador_columna, p_obj_data_aux)
    {
        var l_data_comprimida = moment(p_obj_data_aux).format('YYYYMMDD');
        var l_data_sql        = moment(p_obj_data_aux).format('YYYY-MM-DD');
        var l_temps_inicial   = moment( l_data_sql + " " + "08:00");
        var l_temps_final     = moment( l_data_sql + " " + "24:00");
        var l_temp_aux        = l_temps_inicial;
        var l_cfg_num_minuts_interval = this.g_config_list["cfg_num_minuts_interval"];
         
        var l_html = "";

        this.g_llista_objectes_columna_hores[p_iterador_columna].innerHTML =l_html;
        
        while(l_temp_aux <= l_temps_final)
        {
            var l_id_celda      = l_data_comprimida + "_" +  l_temp_aux.format('HHmm');
            var l_number_pixels = this.g_config_list["cfg_num_pixels_cell_height_px"];

            l_html += '<div class="container cls_cm_celda_hora" style="height:'+ l_number_pixels + 'px;" id="'+ this.g_id_container + l_id_celda +'" >' + 
                '<div class="cls_info_hora">' +  l_temp_aux.format('HH:mm') + '</div>' + 
                '</div>';

            l_temp_aux.add(l_cfg_num_minuts_interval, 'm');
        }
        this.g_llista_objectes_columna_hores[p_iterador_columna].innerHTML = l_html;
    }

    _obtenir_html_div_header_dia (p_obj_data_actual) 
    {
        var l_format = 'YYYY-MM-DD';
        if (this.g_config_list["cfg_data_format"] != undefined)
        {
            l_format = l_format = this.g_config_list["cfg_data_format"];
        }
        var l_resultat = "<h6><span>" + moment(p_obj_data_actual).format(l_format) + "</span></h6>";
        return l_resultat;
    }

     _canviar_valor_input_data()
    {
       var l_str_data = moment(this.g_config_list['cfg_data_inicial']).format('YYYY-MM-DD');
       document.getElementById( this.g_id_container + "_" + 'id_cm_calendari_input_date').value = l_str_data;
    }

    _netejar_horaris()
    {
        var l_list_obj_elements = document.getElementById(this.g_id_container).getElementsByClassName(this.g_classe_div_cell);

        var i = l_list_obj_elements.length;
        while(i > 0)
        {
            i = i - 1;
            l_list_obj_elements[i].parentNode.removeChild(l_list_obj_elements[i]);
        }
    }

    

    _obtain_cell_key_from_datetime(p_jason_element)
    {
        // 2019-01-31 10:00 --> 20190131_1000
        var l_key = null;
        if (p_jason_element['date_sql'])
        {
            if (p_jason_element['date_sql'].length == 16) 
            {
                // la funcio replace no substitueix tots els elements
                l_key =  p_jason_element['date_sql'].substring(0,10).replace(/-/g, '') +
                         "_" + 
                         p_jason_element['date_sql'].substring(11,16).replace(/:/g, '');
            }
        }
        return l_key;
    }


    
    _obtain_cell_key_aproximada(p_key, p_str_datahora_sql)
    {
        // p_key 20190123_1001
        //p_str_datahora_sql 2019-09-23 10:01 
        var l_total_minuts = (parseInt(p_str_datahora_sql.substring(11,13)) * 60) + 
                             (parseInt(p_str_datahora_sql.substring(14,16)));

        var l_coeficient = Math.round(l_total_minuts / this.g_config_list["cfg_num_minuts_interval"]);

        var l_total_minuts_aplicar = (l_coeficient * this.g_config_list["cfg_num_minuts_interval"]);
       
        var l_horaminuts = moment().startOf('day').add(l_total_minuts_aplicar, 'minutes').format('HHmm');

        return ( p_key.substring(0,9) + l_horaminuts );
    }


    _obtenir_element_div_desti (p_key, p_obj_element_json)
    {
        var l_obj_div =  document.getElementById(this.g_id_container + p_key);
        if (l_obj_div == null)
        {
            console.log("schedule : main key not found " + this.g_id_container + " " + p_key);
            if (this.g_config_list["cfg_bool_allow_aproximacions"])
            {
                
                var l_key_aproximada = this._obtain_cell_key_aproximada(p_key, p_obj_element_json['date_sql']);
                console.log("schedule : alternative key  " + this.g_id_container + " " + l_key_aproximada);

                l_obj_div =  document.getElementById(this.g_id_container + l_key_aproximada);                
                if (l_obj_div)
                {
                    console.log("schedule : alternative key found " + this.g_id_container + " " + l_key_aproximada);
                    p_key = l_key_aproximada;
                }
                else
                {
                    console.log("schedule : alternative key not found " + this.g_id_container + " " + l_key_aproximada);
                }
            }
        }
        return l_obj_div;
    }


    _calcular_numero_celdes_necesaries(p_minuts_del_horari)
    {
        var l_resultat = this.g_config_list["cfg_num_cells_height_default"];
        if (p_minuts_del_horari)
        {
            if (p_minuts_del_horari > this.g_config_list["cfg_num_minuts_interval"] )
            {
                var l_cfg_num_minuts_interval = this.g_config_list["cfg_num_minuts_interval"];
                l_resultat  = Math.floor(p_minuts_del_horari / l_cfg_num_minuts_interval);
            }
        }
        return l_resultat;
    }

    _bool_hi_ha_funcio_click_element()
    {
        if (this.g_config_list['cfg_event_click_element'])
        {
            if (typeof this.g_config_list['cfg_event_click_element'] === "function") 
            {
                return true;
            }
        }
        return false;
    }

    _obtenir_objecte_element_div_calendari(p_key, p_obj_element_json, l_index)
    {
        var l_number_pixels             = this.g_config_list["cfg_num_pixels_cell_height_px"];
        var l_number_cells_required     = this._calcular_numero_celdes_necesaries(p_obj_element_json['minutes']);
        var l_estil_div_visita          = "height:"+ (l_number_pixels * l_number_cells_required) +"px;";

        var l_text = "- - - - - -";
        l_text = p_obj_element_json['date_sql'].substring(11,16) + " ";
        if (p_obj_element_json['text']) l_text += p_obj_element_json['text'];

       var l_new_schedule_element = document.createElement('div');
       l_new_schedule_element.className = this.g_classe_div_cell;
       l_new_schedule_element.innerHTML = l_text;
      
       if (this._bool_hi_ha_funcio_click_element())
       {
            l_estil_div_visita += 'cursor:pointer;';
            l_new_schedule_element.setAttribute("onclick", this.g_config_list['cfg_event_click_element'].name +"('"+ this.g_id_container +"','"+p_key+"', "+l_index+")");
       }

       l_new_schedule_element.setAttribute('style', l_estil_div_visita);

       return l_new_schedule_element;
    }


    _mostrar_elements_json()
    {
        this._netejar_horaris();

        var l_date_sql = moment(this.g_config_list['cfg_data_inicial'].format('YYYY-MM-DD'));

        var l_string_date_minima =  moment(l_date_sql).format('YYYYMMDD');
        var l_string_date_maxima =  moment(l_date_sql).add(this.g_config_list['cfg_number_of_days'], 'days').format('YYYYMMDD');

        var l_num_elements = this.g_json_data_schedules.length;

        for (var i = 0; i< l_num_elements; i++) 
        {
            var obj_element_json = this.g_json_data_schedules[i];

            var l_key = this._obtain_cell_key_from_datetime(obj_element_json);  //20190131_1000

            if (l_key)
            {
               var l_string_date = l_key.substring(0,8);
                // validar q element està dins les dates vàlides de la setmana
               if (
                     (l_string_date >= l_string_date_minima) & (l_string_date <= l_string_date_maxima)                      
                   )
                {
                    
                    var l_element_div_desti = this._obtenir_element_div_desti(l_key, obj_element_json);

                    if (l_element_div_desti)
                    {
                        l_element_div_desti.append(this._obtenir_objecte_element_div_calendari(l_key, obj_element_json, i));
                    }
                }
                else console.log("schedule : key is out of date range " + l_key);
            }
        } 
        this. g_obj_span_count.innerHTML =  "" + l_num_elements + " elements";
    }


    _get_json_data_for_test()
    {
        var l_date_aux  = moment(this.g_config_list['cfg_data_inicial']);
        var l_jsonObj   = [];

        l_jsonObj.push(
                    {id:"c0001",text:"Castelló d'Empuries", date_sql:moment(l_date_aux).format('YYYY-MM-DD') +" 10:00", minutes:60} ,
                    {id:"c0002",text:"Figueres", date_sql:moment(l_date_aux).add(Math.floor(Math.random() * 6), 'days').format('YYYY-MM-DD') +" 11:30", minutes:30},
                    {id:"c0003",text:"Vilabertran", date_sql:moment(l_date_aux).add(Math.floor(Math.random() * 6), 'days').format('YYYY-MM-DD') +" 15:00", minutes:90},
                    {id:"c0004",text:"Barcelona", date_sql:moment(l_date_aux).add(Math.floor(Math.random() * 6), 'days').format('YYYY-MM-DD') +" 18:00", minutes:90},
                    {id:"c0005",text:"Girona", date_sql:moment(l_date_aux).add(Math.floor(Math.random() * 6), 'days').format('YYYY-MM-DD') +" 19:00", minutes:240},
                    {id:"c0006",text:"Lleida", date_sql:moment(l_date_aux).add(Math.floor(Math.random() * 6), 'days').format('YYYY-MM-DD') +" 17:00", minutes:30},
                    {id:"c0007",text:"Tarragona", date_sql:moment(l_date_aux).add(Math.floor(Math.random() * 6), 'days').format('YYYY-MM-DD') +" 12:25", minutes:15}
                );

        return l_jsonObj
    }
























      cm_inicialitzar(l_list_keys_values_p_config, p_function_callback)
      {
            if (typeof moment === "undefined") 
			{
                alert('Falta Moment.js');
                return false;
            }
            
            moment.locale('en');
            //moment.locale('es');

            var me = document.querySelector('script[data-name="schedule-week"]');
            if (me)
            {	
                this._asignar_configuracio_per_defecte_o_indicats(l_list_keys_values_p_config);
 
                this._carregar_html_base(p_function_callback);
            }
			else
			{
				alert('Falta atributo data-name="schedule-week" en la llamada al script schedule_week.js');
			}

      }

      cm_set_schedules(p_json_schedules)
      {
               /*  JSON FORMAT ELEMENTS
              {
              id          : unique identifier (required),   
              date_sql    : string represents a date-time format yyyy-mm-dd hh:mm (required), 
              text        : text in the div  (optional),    
              minutes     : number of minutes  (optional)

              other altributes
              }
              */
      
          this.g_json_data_schedules = p_json_schedules;

          //console.log('cm_set_schedules');
          console.table(this.g_json_data_schedules);
      }

      cm_get_random_jsonschedules()
      {
        return this._get_json_data_for_test();
      }

      cm_show_schedules()
      {
          this._mostrar_elements_json();
      }

      cm_show_clear()
      {
        this._netejar_horaris();
      }


      cm_get_schedules()
      {
        return this.g_json_data_schedules;
      }
}
