<?php

namespace App\Http\Controllers;

use App\Globals\Seed;


class SeedController extends Controller
{
   
    public function seed()
    {
        
        $return = Seed::initial_seed();
        echo ($return['status_message']);
        
    }

   
}