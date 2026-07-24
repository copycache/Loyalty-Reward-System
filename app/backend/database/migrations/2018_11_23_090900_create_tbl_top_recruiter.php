<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblTopRecruiter extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_top_recruiter', function (Blueprint $table) 
        {   
            $table->increments('id');
            $table->integer('slot_id')->unsigned();
            $table->integer('total_recruits')->default(0);
            $table->integer('total_leads')->default(0);

            $table->foreign('slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
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
