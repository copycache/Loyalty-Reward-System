<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TblUnilevelItems extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_unilevel_items', function (Blueprint $table) 
        {   
            $table->increments('tbl_unilevel_items_id');
            $table->integer('unilevel_settings_id')->unsigned();
            $table->foreign('unilevel_settings_id')->references('mlm_unilevel_settings_id')->on('tbl_mlm_unilevel_settings')->onDelete('cascade');
            $table->integer('item_qty')->default(0);
            $table->integer('item_id')->unsigned();
            $table->foreign('item_id')->references('item_id')->on('tbl_item')->onDelete('cascade');
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
