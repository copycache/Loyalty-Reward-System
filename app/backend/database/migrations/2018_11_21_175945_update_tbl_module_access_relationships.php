<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblModuleAccessRelationships extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_module_access', function (Blueprint $table) 
        {   
            // $table->integer('position_id')->unsigned()->change();
            // $table->foreign('position_id')->references('position_id')->on('tbl_position')->onDelete('cascade');
            $table->integer('module_id')->unsigned()->change();
            $table->foreign('module_id')->references('module_id')->on('tbl_module')->onDelete('cascade');
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
