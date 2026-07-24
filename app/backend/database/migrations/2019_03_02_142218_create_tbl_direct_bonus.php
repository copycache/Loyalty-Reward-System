<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblDirectBonus extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("tbl_direct_bonus",function ( Blueprint $table )
        {
            $table->increments('direct_bonus_id');
            $table->integer('hierarchy');
            $table->integer('direct_bonus_checkpoint');
            $table->integer('direct_bonus_amount');
            $table->smallinteger('archive')->default(0);
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
