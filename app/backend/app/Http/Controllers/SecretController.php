<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;

class SecretController extends Controller
{
    public function get()
    {
		$return['maintenance'] = DB::table('tbl_mlm_feature')->where('mlm_feature_name', 'website_maintenance')->first();
    	return response()->json($return);
    }
}
