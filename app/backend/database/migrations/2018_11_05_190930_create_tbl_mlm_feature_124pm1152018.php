<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblMlmFeature124pm1152018 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_mlm_feature', function (Blueprint $table) 
        {
            $table->increments('mlm_feature_id');
            $table->string('mlm_feature_name');
            $table->tinyInteger('mlm_feature_enable')->default(0);
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
