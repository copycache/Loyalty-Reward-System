<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblStockistLevel extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_stockist_level', function (Blueprint $table) 
        {
            $table->increments('stockist_level_id');
            $table->string('stockist_level_discount')->default(0);
            $table->string('stockist_level_name');
            $table->datetime('stockist_level_date_created');
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
