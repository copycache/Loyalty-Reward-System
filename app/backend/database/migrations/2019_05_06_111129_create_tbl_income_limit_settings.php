<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblIncomeLimitSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_income_limit_settings', function (Blueprint $table) 
        {
            $table->increments('income_limit_id');
            $table->string('income_limit_status')->default('enable');
            $table->double('income_limit')->default(0);
            $table->string('income_limit_cycle')->default('daily');
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
