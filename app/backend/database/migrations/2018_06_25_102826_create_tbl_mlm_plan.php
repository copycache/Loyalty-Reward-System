<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblMlmPlan extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_mlm_plan', function (Blueprint $table) 
        {
            $table->increments('mlm_plan_id');
            $table->string('mlm_plan_code');
            $table->string('mlm_plan_label')->default("");
            $table->string('mlm_plan_type')->default("");
            $table->string('mlm_plan_trigger');
            $table->tinyInteger('mlm_plan_enable');
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
