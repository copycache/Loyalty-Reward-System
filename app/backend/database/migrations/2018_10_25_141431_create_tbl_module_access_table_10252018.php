<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblModuleAccessTable10252018 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_module_access', function (Blueprint $table) 
        {
            $table->increments('module_access_id');
            $table->integer('position_id');
            $table->integer('module_access')->default(0);
            $table->integer('module_id');
        }); 
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
